export type ProductCatalogItem = {
  productId: string;
  name: string;
  categoryId: string;
  category: string;
  vendor: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  badge?: string;
};

export type HomeProduct = ProductCatalogItem & {
  sold: number;
  stock: number;
  reviewCount: number;
};

export type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  bgClass: string;
};
