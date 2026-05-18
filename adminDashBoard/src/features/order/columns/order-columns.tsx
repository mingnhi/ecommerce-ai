import type { ColumnDef } from "@tanstack/react-table"
import { ChevronRight, Eye, Trash2, User } from "lucide-react"
import type { IAdminOrder, OrderStatus, OrdersTableRow } from "@/features/order/types"
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/features/order/types"
import { formatVnd } from "@/shared/lib/format-vnd"
import { cn } from "@/shared/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

function statusTone(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending:
      "border-amber-500/35 bg-amber-500/[0.07] text-amber-950 dark:text-amber-100",
    confirmed:
      "border-sky-500/40 bg-sky-500/[0.1] text-sky-600 dark:text-sky-400",
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

type BuilderProps = {
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onPreview: (order: IAdminOrder) => void
}

export function buildOrderColumns({
  onUpdateStatus,
  onPreview,
}: BuilderProps): ColumnDef<OrdersTableRow>[] {
  return [
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
            className="text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200 ",
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
              <Avatar
                size="lg"
                className="mt-0.5 size-10 rounded-xl after:rounded-xl"
              >
                {r.avatar ? (
                  <AvatarImage src={r.avatar} alt={r.name} className="rounded-sm" />
                ) : null}
                <AvatarFallback className="rounded-sm border border-sky-500/30 bg-sky-500/10">
                  <User className="size-4 text-sky-500" aria-hidden />
                  <span className="sr-only">{r.name}</span>
                </AvatarFallback>
              </Avatar>
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
        <span className="block text-left text-sm font-medium text-muted-foreground">
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
          <span className="block text-left text-sm font-medium tabular-nums text-foreground">
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
      cell: ({ row, table }) => {
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
              className="text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
              aria-label="Xem chi tiết"
              onClick={() => onPreview(r as IAdminOrder)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:cursor-pointer"
              aria-label="Xóa đơn"
              onClick={() => {
                const meta = table.options.meta as { onDeleteTarget?: (row: OrdersTableRow) => void }
                if (meta?.onDeleteTarget) {
                  meta.onDeleteTarget(r)
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
