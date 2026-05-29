const SOURCES = {
  phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  phoneAlt: "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
  phoneDark: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c",
  tablet: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  case: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb",
  charger: "https://images.unsplash.com/photo-1625948517791-4ee9f9a3361e",
} as const;

export type ProductImageKey = keyof typeof SOURCES;

export function productImage(key: ProductImageKey, width = 400) {
  return `${SOURCES[key]}?auto=format&fit=crop&w=${width}&q=80`;
}

export const PRODUCT_IMAGE_FALLBACK = productImage("phone", 400);
