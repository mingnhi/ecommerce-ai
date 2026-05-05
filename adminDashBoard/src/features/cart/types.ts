export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  productId: string;
}

export interface CartState {
  items: CartItem[];
  isCheckoutOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateQuantityRequest {
  itemId: string;
  quantity: number;
}