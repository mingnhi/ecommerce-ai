from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    APP_NAME: str = "Ecommerce Recommendation API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    ALLOWED_ORIGIN: List[str] = [
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:5173"
    ]
    ALLOWED_METHODS: List[str] = ["*"]
    ALLOWED_HEADERS: List[str] = ["*"]

    API_KEYS: list[str] = ["key-recommend"]

    DEVICE: str = "cpu"
    TOP_K: int = 10

    MODEL_PATH: str = "checkpoints/best_hybrid_model.pth"

    USER_ENCODER_PATH: str = "checkpoints/user_encoder.pkl"
    ITEM_ENCODER_PATH: str = "checkpoints/item_encoder.pkl"
    CATEGORY_ENCODER_PATH: str = "checkpoints/category_encoder.pkl"
    EVENT_ENCODER_PATH: str = "checkpoints/event_encoder.pkl"
    PRICE_SCALER_PATH: str = "checkpoints/price_scaler.pkl"

    USER_EMBEDDINGS_PATH: str = "embeddings/user_embeddings.npy"
    ITEM_EMBEDDINGS_PATH: str = "embeddings/item_embeddings.npy"
    CATEGORY_EMBEDDINGS_PATH: str = "embeddings/category_embeddings.npy"


@lru_cache
def get_settings() -> Settings:
    return Settings()