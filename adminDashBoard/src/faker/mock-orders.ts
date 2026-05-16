import { MOCK_PRODUCTS } from "@/faker/mock-products"
import type { IAdminOrder, IOrderProductLines } from "@/features/orders/types"

function toProduct(index: number, id: string): IOrderProductLines {
  const p = MOCK_PRODUCTS[index]!
  return {
    id,
    productId: p.productId,
    name: p.name,
    image: p.image,
    price: p.price,
    quantity: p.quantity,
  }
}

function lineTotal(index: number) {
  const p = MOCK_PRODUCTS[index]!
  return p.price * p.quantity
}

export const MOCK_ORDERS: IAdminOrder[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-A1B2C3",
    status: "delivered",
    products: [toProduct(0, "op-1")],
    subtotal: lineTotal(0),
    shippingFee: 30_000,
    discount: 10_000,
    total: lineTotal(0) + 20_000,
    createdAt: "2024-05-10T10:30:00Z",
    updatedAt: "2024-05-12T14:20:00Z",
    deliveredAt: "2024-05-12T14:20:00Z",
    customerId: "cust-1",
    customerName: "Nguyễn Minh Anh",
    customerEmail: "minhanh@ecommerce-ai.vn",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-X9Y8Z7",
    status: "shipping",
    products: [toProduct(1, "op-2")],
    subtotal: lineTotal(1),
    shippingFee: 0,
    discount: 0,
    total: lineTotal(1),
    createdAt: "2024-05-14T08:15:00Z",
    updatedAt: "2024-05-15T09:00:00Z",
    customerId: "cust-2",
    customerName: "Trần Quốc Huy",
    customerEmail: "huy.tran@mail.vn",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-M5N6P7",
    status: "pending",
    products: [toProduct(2, "op-3"), toProduct(3, "op-4")],
    subtotal: lineTotal(2) + lineTotal(3),
    shippingFee: 45_000,
    discount: 50_000,
    total: lineTotal(2) + lineTotal(3) - 5_000,
    createdAt: "2024-05-15T10:00:00Z",
    updatedAt: "2024-05-15T10:00:00Z",
    customerId: "cust-1",
    customerName: "Nguyễn Minh Anh",
    customerEmail: "minhanh@ecommerce-ai.vn",
  },
  {
    id: "ord-4",
    orderNumber: "ORD-C4NCEL",
    status: "cancelled",
    products: [toProduct(2, "op-5")],
    subtotal: lineTotal(2),
    shippingFee: 0,
    discount: 0,
    total: lineTotal(2),
    createdAt: "2024-05-08T14:20:00Z",
    updatedAt: "2024-05-09T09:30:00Z",
    customerId: "cust-3",
    customerName: "Lê Phương Mai",
    customerEmail: "mai.le93@gmail.com",
  },
  {
    id: "ord-5",
    orderNumber: "ORD-R3TURN",
    status: "returned",
    products: [toProduct(3, "op-6")],
    subtotal: lineTotal(3),
    shippingFee: 30_000,
    discount: 0,
    total: lineTotal(3),
    createdAt: "2024-05-01T11:00:00Z",
    updatedAt: "2024-05-05T16:45:00Z",
    customerId: "cust-1",
    customerName: "Nguyễn Minh Anh",
    customerEmail: "minhanh@ecommerce-ai.vn",
  },
  {
    id: "ord-6",
    orderNumber: "ORD-CONF01",
    status: "confirmed",
    products: [toProduct(0, "op-7"), toProduct(1, "op-8")],
    subtotal: lineTotal(0) + lineTotal(1),
    shippingFee: 25_000,
    discount: 0,
    total: lineTotal(0) + lineTotal(1) + 25_000,
    createdAt: "2024-05-16T09:00:00Z",
    updatedAt: "2024-05-16T09:05:00Z",
    customerId: "cust-4",
    customerName: "Phạm Đức Thịnh",
    customerEmail: "thinh.work@company.vn",
  },
]
