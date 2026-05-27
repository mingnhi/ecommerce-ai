from functools import lru_cache

import numpy as np

from app.services.model_service import get_model_service


class PreprocessService:
    def __init__(self):
        model_service = get_model_service()

        self.user_encoder = model_service.user_encoder
        self.item_encoder = model_service.item_encoder
        self.category_encoder = model_service.category_encoder
        self.price_scaler = model_service.price_scaler

    def is_known_user(self, user_id: str) -> bool:
        return user_id in self.user_encoder.classes_

    def is_known_item(self, item_id: str) -> bool:
        return item_id in self.item_encoder.classes_

    def is_known_category(self, category_id: str) -> bool:
        return category_id in self.category_encoder.classes_

    def encode_user(self, user_id: str) -> int:
        return int(self.user_encoder.transform([user_id])[0])

    def encode_item(self, item_id: str) -> int:
        return int(self.item_encoder.transform([item_id])[0])

    def encode_category(self, category_id: str) -> int:
        return int(self.category_encoder.transform([category_id])[0])

    def scale_price(self, price: float) -> float:
        price_array = np.array([[float(price)]])
        return float(self.price_scaler.transform(price_array)[0][0])


@lru_cache
def get_preprocess_service():
    return PreprocessService()