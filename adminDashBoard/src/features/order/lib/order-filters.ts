import type { IAdminOrder, OrderStatus, OrdersTableRow } from "@/features/orders/types"

export type OrderListFilters = {
  search: string
  status: OrderStatus | "all"
  dateFrom: string
  dateTo: string
}

export function filterOrders(orders: IAdminOrder[], f: OrderListFilters): IAdminOrder[] {
  const q = f.search.trim().toLowerCase()
  return orders.filter((o) => {
    if (f.status !== "all" && o.status !== f.status) return false
    if (q) {
      const name = o.customerName.toLowerCase()
      const num = o.orderNumber.toLowerCase()
      if (!name.includes(q) && !num.includes(q)) return false
    }
    const day = o.createdAt.slice(0, 10)
    if (f.dateFrom && day < f.dateFrom) return false
    if (f.dateTo && day > f.dateTo) return false
    return true
  })
}

export function groupOrdersByCustomer(orders: IAdminOrder[]): OrdersTableRow[] {
  const map = new Map<string, IAdminOrder[]>()
  for (const o of orders) {
    const list = map.get(o.customerId) ?? []
    list.push(o)
    map.set(o.customerId, list)
  }
  return Array.from(map.entries()).map(([customerId, list]) => {
    const head = list[0]!
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return {
      rowType: "customer" as const,
      id: `customer-${customerId}`,
      customerId,
      name: head.customerName,
      email: head.customerEmail,
      subRows: sorted.map((o) => ({ rowType: "order" as const, ...o })),
    }
  })
}
