"use client";

import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { formatVnd } from "@/lib/format-currency";
import { CartVoucherPopover } from "./CartVoucherPopover";
interface CartSummarySidebarProps {
  selected: Set<string>;
  headerChecked: boolean;
  headerIndeterminate: boolean;
  selectedQty: number;
  selectedSubtotal: number;
  onToggleAll: () => void;
  onDeleteSelected: () => void;
}

export function CartSummarySidebar({
  selected,
  headerChecked,
  headerIndeterminate,
  selectedQty,
  selectedSubtotal,
  onToggleAll,
  onDeleteSelected,
}: CartSummarySidebarProps) {
  const router = useRouter();
  

  return (
    <aside
      className="w-full shrink-0 lg:w-[340px] lg:sticky lg:top-[76px] lg:self-start"
    >
      <div
        className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Ticket className="size-4 text-sky-500" />
            <span>Voucher</span>
          </div>
          <CartVoucherPopover>
            <button type="button" className="cursor-pointer text-sm font-medium text-sky-600 hover:underline hover:cursor-pointer">
              Chọn hoặc nhập mã
            </button>
          </CartVoucherPopover>
        </div>

        <div className="space-y-5 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Checkbox
              className="size-[18px] shrink-0 cursor-pointer rounded-[3px] border border-border data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white"
              checked={headerIndeterminate ? "indeterminate" : headerChecked}
              onCheckedChange={() => onToggleAll()}
            />
            <button
              type="button"
              className="text-sm font-medium text-foreground hover:text-sky-600 hover:cursor-pointer"
              onClick={() => onToggleAll()}
            >
              Chọn tất cả ({selected.size})
            </button>
            <button
              type="button"
              className="cursor-pointer text-sm font-medium text-sky-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 hover:cursor-pointer"
              disabled={selected.size === 0}
              onClick={() => onDeleteSelected()}
            >
              Xóa
            </button>
          </div>

          <div className="space-y-3 rounded-lg bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tổng sản phẩm</span>
              <span className="font-medium tabular-nums text-foreground">{selectedQty}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="font-medium text-foreground">Tổng thanh toán</span>
              <span className="text-xl font-bold tabular-nums text-sky-600">
                {formatVnd(selectedSubtotal)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            disabled={selectedQty === 0}
            onClick={() => {
              const ids = Array.from(selected).join(",");
              const orderId = "c989a77b-624c-4720-8a52-41655e8bb73f";
              `${ROUTES.CHECKOUT}?orderId=${orderId}&ids=${ids}`;
            }}
            className="h-11 w-full cursor-pointer rounded-lg bg-sky-600 text-base font-semibold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            Mua hàng
          </Button>
        </div>
      </div>
    </aside>
  );
}
