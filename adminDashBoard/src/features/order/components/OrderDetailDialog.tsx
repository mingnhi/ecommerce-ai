import type { IAdminOrder } from "@/features/order/types"
import { ORDER_STATUS_LABEL } from "@/features/order/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Separator } from "@/shared/components/ui/separator"
import { formatVnd } from "@/shared/lib/format-vnd"

type Props = {
  order: IAdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({ order, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(640px,85vh)] max-w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-md"
      >
        {order ? (
          <>
            <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
              <DialogTitle className="text-base font-medium">
                {order.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-sm leading-normal">
                {order.customerName} · {ORDER_STATUS_LABEL[order.status]}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm font-medium text-muted-foreground">
                Sản phẩm
              </p>
              <ul className="mt-3 space-y-3">
                {order.products.map((p) => (
                  <li
                    key={p.id}
                    className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-3"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.quantity} × {formatVnd(p.price)}
                      </p>
                    </div>
                    <p className="shrink-0 self-center text-sm font-medium tabular-nums">
                      {formatVnd(p.price * p.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 border-t border-border/60 bg-muted/15 px-5 py-4 text-sm">
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Tạm tính</span>
                <span className="tabular-nums">{formatVnd(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span className="tabular-nums">
                  {formatVnd(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Giảm giá</span>
                <span className="tabular-nums">−{formatVnd(order.discount)}</span>
              </div>
              <Separator className="my-1 bg-border/80" />
              <div className="flex justify-between gap-4 font-medium text-foreground">
                <span>Tổng thanh toán</span>
                <span className="tabular-nums">{formatVnd(order.total)}</span>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
