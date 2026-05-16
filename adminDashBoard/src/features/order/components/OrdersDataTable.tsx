import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type PaginationState,
} from "@tanstack/react-table"
import { BaggageClaim, ChevronRight, Eye, Trash2 } from "lucide-react"
import type { IAdminOrder, OrderStatus, OrdersTableRow } from "@/features/order/types"
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/features/order/types"
import { DeleteOrderDialog } from "@/features/order/components/DeleteOrderDialog"
import { OrderDetailDialog } from "@/features/order/components/OrderDetailDialog"
import { formatVnd } from "@/shared/lib/format-vnd"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const PAGE_SIZES = [5, 10, 20, 50] as const

function statusTone(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending:
      "border-amber-500/35 bg-amber-500/[0.07] text-amber-950 dark:text-amber-100",
    confirmed:
      "border-primary/40 bg-primary/[0.1] text-primary",
    shipping:
      "border-violet-500/35 bg-violet-500/[0.07] text-violet-950 dark:text-violet-100",
    delivered:
      "border-emerald-500/35 bg-emerald-500/[0.07] text-emerald-950 dark:text-emerald-100",
    cancelled:
      "border-border bg-muted/50 text-muted-foreground",
    returned:
      "border-rose-500/35 bg-rose-500/[0.07] text-rose-950 dark:text-rose-100",
  }
  return map[status]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type Props = {
  data: OrdersTableRow[]
  filterKey: string
  onDeleteOrder: (orderId: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

export function OrdersDataTable({
  data,
  filterKey,
  onDeleteOrder,
  onUpdateStatus,
}: Props) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [preview, setPreview] = React.useState<IAdminOrder | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<IAdminOrder | null>(
    null,
  )

  const columns = React.useMemo<ColumnDef<OrdersTableRow>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          if (row.original.rowType !== "customer") {
            return <span className="inline-block w-6 shrink-0" aria-hidden />
          }
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
              onClick={row.getToggleExpandedHandler()}
              aria-expanded={row.getIsExpanded()}
              aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
            >
              <ChevronRight
                className={cn(
                  "size-4 transition-transform duration-200",
                  row.getIsExpanded() && "rotate-90",
                )}
              />
            </Button>
          )
        },
        size: 40,
      },
      {
        id: "info",
        header: () => (
          <span className="text-sm font-medium text-muted-foreground">
            Khách hàng / Đơn hàng
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original
          if (r.rowType === "customer") {
            const n = r.subRows.length
            return (
              <div className="flex min-w-[220px] items-start gap-3.5 py-1">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-sm">
                  <BaggageClaim className="size-4 text-primary" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium leading-snug text-foreground">
                    {r.name}
                  </p>
                  <p className="truncate text-xs leading-normal text-muted-foreground">
                    {r.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {n} đơn hàng
                  </p>
                </div>
              </div>
            )
          }
          const title = r.products.map((p) => p.name).join(" · ")
          return (
            <div className="min-w-[220px] space-y-1 py-1">
              <p className="text-sm font-medium leading-snug text-foreground">
                {r.orderNumber}
              </p>
              <p className="line-clamp-2 text-xs leading-normal text-muted-foreground">
                {title}
              </p>
            </div>
          )
        },
      },
      {
        id: "status",
        header: () => (
          <span className="text-sm font-medium text-muted-foreground">
            Trạng thái
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original
          if (r.rowType === "customer") {
            return (
              <span className="text-muted-foreground tabular-nums">—</span>
            )
          }
          return (
            <Select
              value={r.status}
              onValueChange={(v) =>
                onUpdateStatus(r.id, v as OrderStatus)
              }
            >
              <SelectTrigger
                size="sm"
                className={cn(
                  "h-8 w-45 border shadow-none transition-colors",
                  statusTone(r.status),
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-sm">
                    {ORDER_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        id: "total",
        header: () => (
          <span className="block text-right text-sm font-medium text-muted-foreground">
            Tổng tiền
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original
          if (r.rowType === "customer") {
            return (
              <span className="text-muted-foreground tabular-nums">—</span>
            )
          }
          return (
            <span className="block text-right text-sm font-medium tabular-nums text-foreground">
              {formatVnd(r.total)}
            </span>
          )
        },
      },
      {
        id: "created",
        header: () => (
          <span className="text-sm font-medium text-muted-foreground">
            Ngày tạo
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original
          if (r.rowType === "customer") {
            return (
              <span className="text-muted-foreground tabular-nums">—</span>
            )
          }
          return (
            <span className="text-xs leading-normal tabular-nums text-muted-foreground">
              {formatDate(r.createdAt)}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="block w-full pr-3 text-right text-sm font-medium text-muted-foreground">
            Thao tác
          </span>
        ),
        cell: ({ row }) => {
          const r = row.original
          if (r.rowType === "customer") {
            return null
          }
          return (
            <div className="flex justify-end gap-0.5 pr-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                aria-label="Xem chi tiết"
                onClick={() => setPreview(r)}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Xóa đơn"
                onClick={() => setDeleteTarget(r)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onUpdateStatus],
  )

  const pageCount = Math.max(1, Math.ceil(data.length / pagination.pageSize))

  const pageData = React.useMemo(() => {
    const { pageIndex, pageSize } = pagination
    return data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
  }, [data, pagination])

  React.useEffect(() => {
    setPagination((p) =>
      p.pageIndex === 0 ? p : { ...p, pageIndex: 0 },
    )
  }, [filterKey])

  React.useEffect(() => {
    const maxIdx = Math.max(0, pageCount - 1)
    if (pagination.pageIndex > maxIdx) {
      setPagination((p) => ({ ...p, pageIndex: maxIdx }))
    }
  }, [pageCount, pagination.pageIndex])

  const table = useReactTable({
    data: pageData,
    columns,
    state: { expanded, pagination },
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount,
    getRowId: (row) => row.id,
    getSubRows: (row) =>
      row.rowType === "customer" ? row.subRows : undefined,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  const current = pagination.pageIndex + 1

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-primary/[0.07] dark:bg-card dark:shadow-none">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-b border-primary/15 hover:bg-transparent"
              >
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={cn(
                      "h-11 bg-primary/[0.07] text-sm font-medium text-muted-foreground dark:bg-primary/10",
                      h.column.id === "expander" && "w-10 px-2",
                      h.column.id === "total" && "text-right",
                      h.column.id === "actions" && "pr-3 pl-2",
                    )}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isCust = row.original.rowType === "customer"
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-primary/10 transition-colors dark:border-border/80",
                      isCust &&
                        "bg-primary/6 hover:bg-primary/9 dark:bg-primary/10 dark:hover:bg-primary/[0.14]",
                      !isCust &&
                        "bg-card hover:bg-primary/4 dark:bg-card dark:hover:bg-primary/5",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3 align-middle",
                          cell.column.id === "expander" && "w-10 px-2",
                          cell.column.id === "info" && "align-top",
                          cell.column.id === "actions" && "pr-3 pl-2",
                        )}
                      >
                        {cell.column.id === "info" && row.depth > 0 ? (
                          <div style={{ paddingLeft: `${row.depth * 12}px` }}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Không có đơn hàng phù hợp bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-card px-4 py-3.5 ring-1 ring-primary/5 sm:flex-row sm:items-center sm:justify-between dark:bg-card">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="text-xs text-muted-foreground">Hiển thị</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-18 border-primary/25 bg-transparent"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            nhóm khách / trang
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs tabular-nums text-muted-foreground">
            Trang {pageCount ? current : 0} / {pageCount || 1}
          </p>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-primary/25 px-3 text-xs hover:bg-primary/10 hover:text-primary"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-primary/25 px-3 text-xs hover:bg-primary/10 hover:text-primary"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <OrderDetailDialog
        order={preview}
        open={preview != null}
        onOpenChange={(o) => {
          if (!o) setPreview(null)
        }}
      />
      <DeleteOrderDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        orderNumber={deleteTarget?.orderNumber ?? ""}
        onConfirm={() => {
          if (deleteTarget) onDeleteOrder(deleteTarget.id)
        }}
      />
    </div>
  )
}
