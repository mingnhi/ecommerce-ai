type CartItemResponse = {
  id: string;
  variantId: string;
  quantity: number;
  priceAtTime: number;
  subtotal: number;
};

type CartResponse = {
  id: string;
  userId: string;
  status: string;
  items: CartItemResponse[];
  total: number;
  itemCount: number;
};
