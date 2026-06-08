export type OrderItemResponse = {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  thumbnail?: string;
};

export type OrderResponse = {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemResponse[];
};

export type BulkUpdateStatusResponse = {
  total: number;
  succeededCount: number;
  failedCount: number;
  succeeded: string[];
  failed: { orderId: string; reason: string }[];
};
