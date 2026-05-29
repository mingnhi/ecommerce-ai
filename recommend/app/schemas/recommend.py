from typing import Optional, List
from pydantic import BaseModel, Field
from typing import List, Optional

class ProductInput(BaseModel):
    id: str
    category_id: str
    price: float = Field(..., gt=0)
    name: Optional[str] = None
    image: Optional[str] = None


class RecommendRequest(BaseModel):
    user_id: str
    products: List[ProductInput]
    top_k: int = Field(default=10, ge=1, le=100)

class RecommendationItem(BaseModel):
    product_id: str
    score: float
    name: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[str] = None
class RecommendResult(BaseModel):
    user_id: str
    cold_start: bool
    total_products: int
    recommendations: List[RecommendationItem]


class RecommendResponse(BaseModel):
    user_id: str
    recommendations: List[RecommendResult]
