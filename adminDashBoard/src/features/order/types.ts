export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returned"

export interface IOrderProductLines {
  id: string
  productId: string
  name: string
  image?: string
  price: number
  originalPrice?: number
  quantity: number
}

export interface IAdminOrder {
  id: string
  orderNumber: string
  status: OrderStatus
  products: IOrderProductLines[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  createdAt: string
  updatedAt: string
  deliveredAt?: string
  customerId: string
  customerName: string
  customerEmail: string
}

export type OrdersTableRow =
  | {
      rowType: "customer"
      id: string
      customerId: string
      name: string
      email: string
      subRows: OrdersTableRow[]
    }
  | ({
      rowType: "order"
    } & IAdminOrder)

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  returned: "Hoàn trả",
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
  "cancelled",
  "returned",
]
