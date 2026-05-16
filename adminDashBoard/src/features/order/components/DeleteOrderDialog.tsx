import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderNumber: string
  onConfirm: () => void
}

export function DeleteOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 p-0 sm:max-w-sm"
      >
        <DialogHeader className="px-5 pt-5 pb-2 text-left">
          <DialogTitle className="text-base">Xóa đơn hàng?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Đơn{" "}
            <span className="font-medium text-foreground">
              {orderNumber}
            </span>{" "}
            sẽ bị gỡ khỏi danh sách. Thao tác không hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/20 sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Xóa đơn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
