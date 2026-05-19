import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { MOCK_ORDERS } from "@/faker/mock-orders"
import { buildOrderColumns } from "@/features/order/columns/order-columns"
import { OrderDetailDialog } from "@/features/order/components/OrderDetailDialog"
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  type IAdminOrder,
  type OrderStatus,
  type OrdersTableRow,
} from "@/features/order/types"
import { DataTableBase } from "@/shared/components/common/DataTableBase"
import {
  type OrderListFilters,
  filterOrders,
  groupOrdersByCustomer,
} from "@/features/order/lib"
import { cn } from "@/shared/lib/utils"

const defaultFilters: OrderListFilters = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
}

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<IAdminOrder[]>(() => [...MOCK_ORDERS])
  const [filters, setFilters] = React.useState<OrderListFilters>(defaultFilters)
  const [preview, setPreview] = React.useState<IAdminOrder | null>(null)

  const filtered = React.useMemo(
    () => filterOrders(orders, filters),
    [orders, filters],
  )
  const data = React.useMemo(
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

  const columns = React.useMemo(
    () =>
      buildOrderColumns({
        onUpdateStatus,
        onPreview: setPreview,
      }),
    [onUpdateStatus],
  )

  const getSubRows = (row: OrdersTableRow) =>
    row.rowType === "customer" ? row.subRows : undefined

  const rowClassName = (row: Row<OrdersTableRow>) => {
    const isCust = row.original.rowType === "customer"
    return (
      cn(
        "border-sky-500/10 transition-colors dark:border-border/80",
        isCust &&
          "bg-sky-500/6 hover:bg-sky-500/9 dark:bg-sky-500/10 dark:hover:bg-sky-500/[0.14]",
        !isCust &&
          "bg-card hover:bg-sky-500/4 dark:bg-card dark:hover:bg-sky-500/5",
      )
    )
  }

  const toolbarConfig = React.useMemo(
    () => ({
      title: "Bộ lọc",
      description: "Tìm theo tên khách hoặc mã đơn, trạng thái và khoảng thời gian",
      onReset: () => setFilters(defaultFilters),
      fields: [
        {
          type: "search" as const,
          placeholder: "Tên khách hàng hoặc mã đơn...",
          value: filters.search,
          onChange: (v: string) => setFilters((f) => ({ ...f, search: v })),
        },
        {
          type: "select" as const,
          placeholder: "Trạng thái",
          value: filters.status,
          onChange: (v: string) =>
            setFilters((f) => ({ ...f, status: v as OrderStatus | "all" })),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] })),
          ],
        },
        {
          type: "date" as const,
          label: "Từ ngày",
          value: filters.dateFrom,
          onChange: (v: string) => setFilters((f) => ({ ...f, dateFrom: v })),
        },
        {
          type: "date" as const,
          label: "Đến ngày",
          value: filters.dateTo,
          onChange: (v: string) => setFilters((f) => ({ ...f, dateTo: v })),
        },
      ],
    }),
    [filters],
  )

  const deleteConfig = React.useMemo(
    () => ({
      title: "Xóa đơn hàng?",
      getConfirmName: (row: OrdersTableRow) => (row as IAdminOrder).orderNumber || "",
      onConfirm: (row: OrdersTableRow) => onDeleteOrder(row.id),
    }),
    [onDeleteOrder],
  )

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <div className="space-y-5">
        <DataTableBase
          data={data}
          columns={columns}
          filterKey={filterKey}
          getSubRows={getSubRows}
          mainColumnId="info"
          rowClassName={rowClassName}
          emptyMessage="Không có đơn hàng phù hợp bộ lọc."
          pageSizeLabel="nhóm khách / trang"
          toolbarConfig={toolbarConfig}
          deleteConfig={deleteConfig}
        />

        <OrderDetailDialog
          order={preview}
          open={preview != null}
          onOpenChange={(o) => {
            if (!o) setPreview(null)
          }}
        />
      </div>
    </div>
  )
}
