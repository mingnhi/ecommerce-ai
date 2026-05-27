from fastapi import APIRouter, Depends

from app.core.security import verify_api_key
from app.core.response import APIResponse, create_response
from app.schemas import RecommendRequest, RecommendResult
from app.services.recommend_service import (
    RecommendService,
    get_recommend_service,
)


router = APIRouter(
    prefix="/recommend",
    tags=["Recommendation"],
    dependencies=[Depends(verify_api_key)]
)


@router.post(
    "/",
    response_model=APIResponse[RecommendResult]
)
async def recommend_products(
    request: RecommendRequest,
    recommend_service: RecommendService = Depends(get_recommend_service)
):
    result = recommend_service.recommend(
        user_id=request.user_id,
        products=request.products,
        top_k=request.top_k
    )

    return create_response(
        status=True,
        messages=["Recommend products successfully."],
        data=result
    )


@router.get("/health")
async def health_check():
    return create_response(
        status=True,
        messages=["Recommendation API is running."],
        data={
            "service": "recommendation",
            "model": "Hybrid NCF",
            "endpoint": "/api/v1/recommend/"
        }
    )