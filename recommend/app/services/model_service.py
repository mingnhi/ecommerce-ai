from functools import lru_cache

import joblib
import torch

from app.core.config import get_settings
from app.core.logger import logger
from app.models.hybrid_ncf import HybridNCF

settings = get_settings()


class ModelService:
    def __init__(self):
        self.device = torch.device(settings.DEVICE)

        self.user_encoder = None
        self.item_encoder = None
        self.category_encoder = None
        self.event_encoder = None
        self.price_scaler = None
        self.model = None

        self.load_artifacts()

    def load_artifacts(self):
        logger.info("Loading recommendation artifacts...")

        self.user_encoder = joblib.load(settings.USER_ENCODER_PATH)
        self.item_encoder = joblib.load(settings.ITEM_ENCODER_PATH)
        self.category_encoder = joblib.load(settings.CATEGORY_ENCODER_PATH)
        self.price_scaler = joblib.load(settings.PRICE_SCALER_PATH)

        try:
            self.event_encoder = joblib.load(settings.EVENT_ENCODER_PATH)
        except Exception:
            self.event_encoder = None

        checkpoint = torch.load(
            settings.MODEL_PATH,
            map_location=self.device
        )

        num_users = checkpoint.get(
            "num_users",
            len(self.user_encoder.classes_)
        )
        num_items = checkpoint.get(
            "num_items",
            len(self.item_encoder.classes_)
        )
        num_categories = checkpoint.get(
            "num_categories",
            len(self.category_encoder.classes_)
        )
        embedding_dim = checkpoint.get("embedding_dim", 64)

        self.model = HybridNCF(
            num_users=num_users,
            num_items=num_items,
            num_categories=num_categories,
            embedding_dim=embedding_dim
        ).to(self.device)

        if "model_state_dict" in checkpoint:
            self.model.load_state_dict(checkpoint["model_state_dict"])
        else:
            self.model.load_state_dict(checkpoint)

        self.model.eval()

        logger.info("Recommendation model loaded successfully.")

    def get_model(self):
        return self.model


@lru_cache
def get_model_service():
    return ModelService()