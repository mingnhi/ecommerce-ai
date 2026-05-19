"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Ticket } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { siteConfig } from "@/configs/site";
import { useCart } from "@/hooks/use-cart";
import { CartVoucherPopover } from "./components/CartVoucherPopover";
import { CartItem } from "./components/CartItem";
import { CartSummarySidebar } from "./components/CartSummarySidebar";

function EmptyCart() {
  return (
    <div className="flex min-h-[calc(100vh-66px)] flex-col ">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative inline-flex">
            <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-sky-500/10 blur-2xl" />
            <div className="relative flex size-32 items-center justify-center rounded-full border-4 border-sky-500/20 bg-background shadow-xl">
              <ShoppingCart className="size-14 stroke-[1.5] text-sky-500/40" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Giỏ hàng của bạn đang trống</h2>
            <p className="mx-auto max-w-[280px] leading-relaxed text-muted-foreground">
              Hãy lấp đầy giỏ hàng bằng những sản phẩm công nghệ tuyệt vời nhất tại {siteConfig.name}.
            </p>
          </div>
          <Button
            asChild
            className="h-12 cursor-pointer rounded-full bg-sky-600 px-10 font-bold text-white shadow-lg shadow-sky-600/20 transition-all hover:scale-105 hover:bg-sky-700 active:scale-95 hover:cursor-pointer"
          >
            <Link href={ROUTES.HOME}>Khám phá ngay</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, removeLine, setLineQuantity } = useCart();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      items.forEach((i) => {
        if (prev.has(i.id)) next.add(i.id);
      });
      return next;
    });
  }, [items]);

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const someSelected = items.some((i) => selected.has(i.id));
  const headerChecked = allSelected;
  const headerIndeterminate = someSelected && !allSelected;

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (items.every((i) => next.has(i.id))) {
        items.forEach((i) => next.delete(i.id));
      } else {
        items.forEach((i) => next.add(i.id));
      }
      return next;
    });
  }, [items]);

  const toggleLine = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedQty = useMemo(
    () => items.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.quantity, 0),
    [items, selected]
  );

  const selectedSubtotal = useMemo(
    () => items.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.price * i.quantity, 0),
    [items, selected]
  );

  const deleteSelected = useCallback(() => {
    selected.forEach((id) => removeLine(id));
    setSelected(new Set());
  }, [selected, removeLine]);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-auto py-6 sm:py-8">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-3 lg:hidden">
                <Checkbox
                  className="size-[18px] shrink-0 cursor-pointer rounded-[3px] border border-border data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white"
                  checked={headerIndeterminate ? "indeterminate" : headerChecked}
                  onCheckedChange={() => toggleAll()}
                />
                <button
                  type="button"
                  className="text-sm font-medium text-foreground hover:cursor-pointer"
                  onClick={() => toggleAll()}
                >
                  Chọn tất cả ({items.length})
                </button>
              </div>

              <div className="hidden border-b border-border/50 bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid lg:grid-cols-[40px_minmax(0,1fr)_96px_120px_96px_40px] lg:items-center lg:gap-3">
                <div className="flex justify-center">
                  <Checkbox
                    className="size-[18px] shrink-0 cursor-pointer rounded-[3px] border border-border data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white"
                    checked={headerIndeterminate ? "indeterminate" : headerChecked}
                    onCheckedChange={() => toggleAll()}
                  />
                </div>
                <span>Sản phẩm</span>
                <span className="text-center">Đơn giá</span>
                <span className="text-center">Số lượng</span>
                <span className="text-center">Thành tiền</span>
                <span className="sr-only">Xóa</span>
              </div>

              <div className="divide-y divide-border/30">
                {items.map((line) => (
                  <CartItem
                    key={line.id}
                    line={line}
                    isSel={selected.has(line.id)}
                    onToggle={toggleLine}
                    onRemove={removeLine}
                    onQuantityChange={setLineQuantity}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border/50 bg-sky-500/5 px-4 py-3 text-sm">
                <Ticket className="size-4 shrink-0 text-sky-500" />
                <span className="text-foreground/90">Voucher giảm đến 30k</span>
                <CartVoucherPopover>
                  <button type="button" className="ml-auto cursor-pointer text-xs font-medium text-sky-600 hover:underline hover:cursor-pointer">
                    Xem thêm voucher
                  </button>
                </CartVoucherPopover>
              </div>
            </div>
          </div>

          <CartSummarySidebar
            selected={selected}
            headerChecked={headerChecked}
            headerIndeterminate={headerIndeterminate}
            selectedQty={selectedQty}
            selectedSubtotal={selectedSubtotal}
            onToggleAll={toggleAll}
            onDeleteSelected={deleteSelected}
          />
        </div>
      </div>
    </div>
  );
}
