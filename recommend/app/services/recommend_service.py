from functools import lru_cache

import torch

from app.core.config import get_settings
from app.core.logger import logger
from app.schemas.recommend import ProductInput
from app.services.model_service import get_model_service
from app.services.preprocess_service import get_preprocess_service

settings = get_settings()


class RecommendService:
    def __init__(self):
        self.device = torch.device(settings.DEVICE)

        self.model_service = get_model_service()
        self.preprocess_service = get_preprocess_service()

        self.model = self.model_service.get_model()

    def recommend(
        self,
        user_id: str,
        products: list[ProductInput],
        top_k: int = 10
    ):
        logger.info(f"Recommend request user_id={user_id}, total_products={len(products)}")

        if not self.preprocess_service.is_known_user(user_id):
            return {
                "user_id": user_id,
                "cold_start": True,
                "total_products": len(products),
                "recommendations": self._fallback(products, top_k)
            }

        encoded_user = self.preprocess_service.encode_user(user_id)
        results = []

        for product in products:
            if not self.preprocess_service.is_known_item(product.id):
                continue

            if not self.preprocess_service.is_known_category(product.category_id):
                continue

            encoded_item = self.preprocess_service.encode_item(product.id)
            encoded_category = self.preprocess_service.encode_category(
                product.category_id
            )
            scaled_price = self.preprocess_service.scale_price(product.price)

            score = self._predict(
                encoded_user=encoded_user,
                encoded_item=encoded_item,
                encoded_category=encoded_category,
                scaled_price=scaled_price
            )

            results.append({
                "product_id": product.id,
                "score": score,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "category_id": product.category_id
            })

        results.sort(key=lambda item: item["score"], reverse=True)

        return {
            "user_id": user_id,
            "cold_start": False,
            "total_products": len(products),
            "recommendations": results[:top_k]
        }

    def _predict(
        self,
        encoded_user: int,
        encoded_item: int,
        encoded_category: int,
        scaled_price: float
    ) -> float:
        user_tensor = torch.tensor(
            [encoded_user],
            dtype=torch.long,
            device=self.device
        )

        item_tensor = torch.tensor(
            [encoded_item],
            dtype=torch.long,
            device=self.device
        )

        category_tensor = torch.tensor(
            [encoded_category],
            dtype=torch.long,
            device=self.device
        )

        price_tensor = torch.tensor(
            [scaled_price],
            dtype=torch.float,
            device=self.device
        )

        with torch.no_grad():
            score = self.model(
                user_tensor,
                item_tensor,
                category_tensor,
                price_tensor
            ).item()

        return float(score)

    def _fallback(self, products: list[ProductInput], top_k: int):
        sorted_products = sorted(
            products,
            key=lambda item: float(item.price),
            reverse=True
        )

        return [
            {
                "product_id": product.id,
                "score": 0.0,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "category_id": product.category_id
            }
            for product in sorted_products[:top_k]
        ]


@lru_cache
def get_recommend_service():
    return RecommendService()