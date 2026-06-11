import type { Product } from "@/apis/product/types";
import type { RecommendationData } from "@/apis/user-event/types";
import { PRODUCT_CATALOG } from "@/faker/mock-products";

const MOCK_ITEMS: Product[] = PRODUCT_CATALOG.map((item) => ({
  id: item.productId,
  name: item.name,
  slug: item.productId,
  thumbnail: item.image,
  isActive: true,
  createdAt: new Date().toISOString(),
  category: {
    id: item.categoryId,
    name: item.category,
    slug: item.categoryId,
  },
  price: {
    price: item.price,
    originalPrice: item.originalPrice,
    discountPercent: Math.round(
      ((item.originalPrice - item.price) / item.originalPrice) * 100,
    ),
    currency: "VND",
  },
  variants: [],
  attributes: [],
  images: [],
}));

export function getMockRecommendationData(limit = 10): RecommendationData {
  const recommendations = MOCK_ITEMS.slice(0, limit);
  const totalItems = MOCK_ITEMS.length;

  return {
    user_id: "mock-user",
    cold_start: false,
    total_products: totalItems,
    recommendations,
    meta: {
      page: 1,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
