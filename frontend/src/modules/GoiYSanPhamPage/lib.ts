import type { Product } from "@/apis/product/types";
import type { RecommendedProduct } from "@/apis/user-event/types";

export function mapRecommendedToProduct(item: RecommendedProduct): Product {
  return {
    id: item.id,
    name: item.name,
    slug: item.id,
    thumbnail: item.image,
    isActive: true,
    createdAt: new Date().toISOString(),
    category: {
      id: item.category_id,
      name: item.category_id,
      slug: item.category_id,
    },
    price: {
      price: item.price,
      originalPrice: item.price,
      currency: "VND",
    },
    variants: [],
    attributes: [],
    images: item.image
      ? [
          {
            id: `${item.id}-thumb`,
            imageUrl: item.image,
            type: "THUMBNAIL",
            sortOrder: 0,
            isPrimary: true,
            createdAt: new Date().toISOString(),
          },
        ]
      : [],
  };
}
