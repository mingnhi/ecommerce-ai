export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'shipping' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export interface IOrderProduct {
  id: string;
  productId: string;
  name: string;
  image?: string;
  variantLabel?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  shopName: string;
  shopId: string;
  status: OrderStatus;
  products: IOrderProduct[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface IOrderListParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}
