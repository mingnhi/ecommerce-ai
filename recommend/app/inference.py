from app.schemas.recommend import ProductInput
from app.services.recommend_service import (
    get_recommend_service
)


def run_inference():
    recommend_service = get_recommend_service()

    products = [
        ProductInput(
            id="product_1",
            category_id="category_1",
            price=15000000,
            name="iPhone 15",
            image="iphone15.jpg"
        ),

        ProductInput(
            id="product_2",
            category_id="category_1",
            price=12000000,
            name="Samsung S24",
            image="s24.jpg"
        ),

        ProductInput(
            id="product_3",
            category_id="category_2",
            price=2500000,
            name="Nike Air Force 1",
            image="nike.jpg"
        )
    ]

    result = recommend_service.recommend(
        user_id="user_1",
        products=products,
        top_k=5
    )

    print("\n========== RESULT ==========\n")

    for item in result["recommendations"]:
        print(
            f'Product: {item["product_id"]} | '
            f'Score: {item["score"]:.4f}'
        )


if __name__ == "__main__":
    run_inference()