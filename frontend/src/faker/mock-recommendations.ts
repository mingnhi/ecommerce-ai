import type { RecommendationData, RecommendedProduct } from "@/apis/user-event/types";
import { PRODUCT_CATALOG } from "@/faker/mock-products";

const MOCK_ITEMS: RecommendedProduct[] = PRODUCT_CATALOG.map((item, index) => ({
  id: item.productId,
  category_id: item.category,
  price: item.price,
  name: item.name,
  image: item.image,
  recommendScore: Math.max(0.55, 0.98 - index * 0.03),
}));

export function getMockRecommendationData(limit = 10): RecommendationData {
  const recommendations = MOCK_ITEMS.slice(0, limit);

  return {
    user_id: "mock-user",
    cold_start: false,
    total_products: MOCK_ITEMS.length,
    recommendations,
  };
}
