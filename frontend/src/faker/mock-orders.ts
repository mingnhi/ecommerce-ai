import { MOCK_PRODUCTS } from "@/faker/mock-products";
import type { IOrder, IOrderProduct } from "@/types/order";

function toProduct(index: number, id: string): IOrderProduct {
  const p = MOCK_PRODUCTS[index];
  return {
    id,
    productId: p.productId,
    name: p.name,
    image: p.image ?? undefined,
    price: p.price,
    quantity: p.quantity,
  };
}

function lineTotal(index: number) {
  const p = MOCK_PRODUCTS[index];
  return p.price * p.quantity;
}

export const MOCK_ORDERS: IOrder[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-A1B2C3",
    status: "delivered",
    products: [toProduct(0, "op-1")],
    subtotal: lineTotal(0),
    shippingFee: 30000,
    discount: 10000,
    total: lineTotal(0) + 20000,
    createdAt: "2024-05-10T10:30:00Z",
    updatedAt: "2024-05-12T14:20:00Z",
    deliveredAt: "2024-05-12T14:20:00Z",
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
  },
  {
    id: "ord-3",
    orderNumber: "ORD-M5N6P7",
    status: "pending",
    products: [toProduct(2, "op-3"), toProduct(3, "op-4")],
    subtotal: lineTotal(2) + lineTotal(3),
    shippingFee: 45000,
    discount: 50000,
    total: lineTotal(2) + lineTotal(3) - 5000,
    createdAt: "2024-05-15T10:00:00Z",
    updatedAt: "2024-05-15T10:00:00Z",
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
  },
  {
    id: "ord-5",
    orderNumber: "ORD-R3TURN",
    status: "returned",
    products: [toProduct(3, "op-6")],
    subtotal: lineTotal(3),
    shippingFee: 30000,
    discount: 0,
    total: lineTotal(3),
    createdAt: "2024-05-01T11:00:00Z",
    updatedAt: "2024-05-05T16:45:00Z",
  },
];
