import * as React from "react"
import { MOCK_ORDERS } from "@/faker/mock-orders"
import { OrdersDataTable } from "@/features/order/components/OrdersDataTable"
import { OrdersToolbar } from "@/features/order/components/OrdersToolbar"
import {
  type OrderListFilters,
  filterOrders,
  groupOrdersByCustomer,
} from "@/features/order/lib/order-filters"
import type { IAdminOrder, OrderStatus } from "@/features/order/types"

const defaultFilters: OrderListFilters = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
}

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<IAdminOrder[]>(() => [...MOCK_ORDERS])
  const [filters, setFilters] = React.useState<OrderListFilters>(defaultFilters)

  const filtered = React.useMemo(
    () => filterOrders(orders, filters),
    [orders, filters],
  )
  const tree = React.useMemo(
    () => groupOrdersByCustomer(filtered),
    [filtered],
  )

  const filterKey = React.useMemo(
    () =>
      [
        filters.search,
        filters.status,
        filters.dateFrom,
        filters.dateTo,
        orders.length,
        filtered.length,
      ].join("|"),
    [filters, orders.length, filtered.length],
  )

  const onDeleteOrder = React.useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }, [])

  const onUpdateStatus = React.useCallback(
    (orderId: string, status: OrderStatus) => {
      const now = new Date().toISOString()
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o
          return {
            ...o,
            status,
            updatedAt: now,
            ...(status === "delivered"
              ? { deliveredAt: now }
              : { deliveredAt: undefined }),
          }
        }),
      )
    },
    [],
  )

  return (
    <div className="mx-auto flex w-full flex-col gap-6  md:gap-3">
      <OrdersToolbar
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />
      <OrdersDataTable
        data={tree}
        filterKey={filterKey}
        onDeleteOrder={onDeleteOrder}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  )
}
