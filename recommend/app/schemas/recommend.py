from typing import Optional, List
from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendRequest(BaseModel):
    user_id: str
    top_k: int = 10


class RecommendResult(BaseModel):
    product_id: str
    score: float
    category_id: Optional[str] = None
    price: Optional[float] = None


class RecommendResponse(BaseModel):
    user_id: str
    recommendations: List[RecommendResult]


class ProductInput(BaseModel):
    id: str
    category_id: str

    price: float = Field(
        ...,
        gt=0
    )

    name: Optional[str] = None
    image: Optional[str] = None