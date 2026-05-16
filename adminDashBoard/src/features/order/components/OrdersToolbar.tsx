import * as React from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import type { OrderListFilters } from "@/shared/lib/order-filters"
import type { OrderStatus } from "@/features/order/types"
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/features/order/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Card, CardContent } from "@/shared/components/ui/card"

type Props = {
  value: OrderListFilters
  onChange: (next: OrderListFilters) => void
  onReset: () => void
}

export function OrdersToolbar({ value, onChange, onReset }: Props) {
  const patch = React.useCallback(
    (part: Partial<OrderListFilters>) => onChange({ ...value, ...part }),
    [value, onChange],
  )

  return (
    <Card className="rounded-sm border-primary/20 bg-card/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-primary/5 dark:bg-card">
      <CardContent className="flex flex-col gap-5 ">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-sm border border-primary/25 bg-primary/10">
              <SlidersHorizontal className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Bộ lọc
              </p>
              <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
                Tìm theo tên khách hoặc mã đơn, trạng thái và khoảng thời gian
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full border-primary/25 px-4 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={onReset}
          >
            Đặt lại
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary/70" />
            <Input
              className="h-10 border-primary/20 bg-background pl-10 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-primary/20"
              placeholder="Tên khách hàng hoặc mã đơn..."
              value={value.search}
              onChange={(e) => patch({ search: e.target.value })}
              aria-label="Tìm kiếm"
            />
          </div>
          <Select
            value={value.status}
            onValueChange={(v) =>
              patch({ status: v as OrderStatus | "all" })
            }
          >
            <SelectTrigger className="h-10 py-5 w-full border-primary/20 bg-background text-sm focus:ring-primary/20">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="h-10 border-primary/20 bg-background text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
            type="date"
            value={value.dateFrom}
            onChange={(e) => patch({ dateFrom: e.target.value })}
            aria-label="Từ ngày"
          />
          <Input
            className="h-10 border-primary/20 bg-background text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
            type="date"
            value={value.dateTo}
            onChange={(e) => patch({ dateTo: e.target.value })}
            aria-label="Đến ngày"
          />
        </div>
      </CardContent>
    </Card>
  )
}
