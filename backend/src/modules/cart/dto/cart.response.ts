export type CartItemSnapshot = {
  productName: string;
  variantLabel?: string;
  thumbnail: string | null;
};

export type CartItemResponse = CartItemSnapshot & {
  id: string;
  variantId: string;
  quantity: number;
  priceAtTime: number;
  subtotal: number;
};

export type CartResponse = {
  id: string;
  userId: string;
  status: string;
  items: CartItemResponse[];
  total: number;
  itemCount: number;
};
