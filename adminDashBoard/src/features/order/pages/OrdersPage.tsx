import * as React from "react"
import type { Row } from "@tanstack/react-table"
import { toast } from "sonner"
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
import { PageSkeleton } from "@/shared/components/common/PageSkeleton"
import {
  buildOrderQuery,
  filterOrders,
  groupOrdersByCustomer,
  toAdminOrder,
  type OrderListFilters,
} from "@/features/order/lib"
import { useOrders, useDeleteOrder, useUpdateOrderStatus } from "@/features/order/hooks"
import { useUsers } from "@/features/users/hooks"
import { cn } from "@/shared/lib/utils"
import { isOrderRow } from "@/features/order/lib"

const defaultFilters: OrderListFilters = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
}

export default function OrdersPage() {
  const [filters, setFilters] = React.useState<OrderListFilters>(defaultFilters)
  const [preview, setPreview] = React.useState<IAdminOrder | null>(null)

  const query = React.useMemo(() => buildOrderQuery(filters), [filters])
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const { data, isLoading: ordersLoading } = useOrders(query)
  const updateStatusMutation = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()

  const orders = React.useMemo(() => {
    const userMap = new Map(users.map((user) => [user.id, user]))
    return (data?.items ?? []).map((order) =>
      toAdminOrder(order, userMap.get(order.userId)),
    )
  }, [data?.items, users])

  const filtered = React.useMemo(
    () => filterOrders(orders, filters),
    [orders, filters],
  )
  const tableData = React.useMemo(
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

  const onUpdateStatus = React.useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        await updateStatusMutation.mutateAsync({ id: orderId, status })
        toast.success("Cập nhật trạng thái đơn hàng thành công")
      } catch {
        toast.error("Không thể cập nhật trạng thái đơn hàng")
      }
    },
    [updateStatusMutation],
  )

  const onDeleteOrder = React.useCallback(
    async (order: IAdminOrder) => {
      try {
        await deleteMutation.mutateAsync(order.id)
        if (preview?.id === order.id) setPreview(null)
        toast.success("Xóa đơn hàng thành công")
      } catch {
        toast.error("Không thể xóa đơn hàng")
      }
    },
    [deleteMutation, preview?.id],
  )

  const deleteConfig = React.useMemo(
    () => ({
      title: "Xóa đơn hàng",
      getConfirmName: (row: OrdersTableRow) =>
        isOrderRow(row) ? row.orderNumber : "",
      onConfirm: (row: OrdersTableRow) => {
        if (!isOrderRow(row)) return
        void onDeleteOrder(row)
      },
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa khỏi hệ thống. Thao tác không hoàn tác.",
    }),
    [onDeleteOrder],
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
    return cn(
      "border-sky-500/10 transition-colors dark:border-border/80",
      isCust &&
        "bg-sky-500/6 hover:bg-sky-500/9 dark:bg-sky-500/10 dark:hover:bg-sky-500/[0.14]",
      !isCust &&
        "bg-card hover:bg-sky-500/4 dark:bg-card dark:hover:bg-sky-500/5",
    )
  }

  const toolbarConfig = React.useMemo(
    () => ({
      title: "Bộ lọc đơn hàng",
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

  if (ordersLoading || usersLoading) {
    return <PageSkeleton filterCount={2} columnCount={4} />
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <div className="space-y-5">
        <DataTableBase
          data={tableData}
          columns={columns}
          filterKey={filterKey}
          getSubRows={getSubRows}
          mainColumnId="info"
          rowClassName={rowClassName}
          emptyMessage="Không có đơn hàng phù hợp bộ lọc."
          pageSizeLabel="nhóm khách / trang"
          toolbarConfig={toolbarConfig}
          deleteConfig={deleteConfig}
          defaultExpandedAll={true}
        />

        <OrderDetailDialog
          order={preview}
          open={preview != null}
          onOpenChange={(open) => {
            if (!open) setPreview(null)
          }}
        />
      </div>
    </div>
  )
}
