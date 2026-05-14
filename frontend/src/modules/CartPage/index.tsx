"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { formatVnd } from "@/lib/format-currency";
import { siteConfig } from "@/configs/site";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { CartVoucherPopover } from "./components/CartVoucherPopover";
import { CartItem } from "./components/CartItem";
import { ShoppingCart } from "lucide-react";

const cartGrid =
  "grid grid-cols-[48px_minmax(220px,1fr)_112px_128px_112px_88px] items-center gap-x-3";

const chk =
  "size-[18px] cursor-pointer rounded-[3px] border border-[#d0d0d0] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";

const linkBtn = "cursor-pointer text-primary hover:underline";

function EmptyCart() {
  return (
    <div className="min-h-[calc(100vh-66px)] bg-muted/25 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 animate-pulse" />
            <div className="relative size-32 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center shadow-xl">
              <ShoppingCart className="size-14 text-primary/40 stroke-[1.5]" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
              Hãy lấp đầy giỏ hàng bằng những sản phẩm công nghệ tuyệt vời nhất tại {siteConfig.name}.
            </p>
          </div>
          <Button
            asChild
            className="h-12 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Link href={ROUTES.HOME}>Khám phá ngay</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
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

  const allFilteredSelected =
    items.length > 0 && items.every((i) => selected.has(i.id));
  const someFilteredSelected = items.some((i) => selected.has(i.id));

  const headerChecked = allFilteredSelected;
  const headerIndeterminate = someFilteredSelected && !allFilteredSelected;

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
    <div className="min-h-[calc(100vh-66px)] bg-muted/25 py-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="overflow-hidden shadow-sm rounded-sm border border-border/60 bg-card shadow-sm ring-1 ring-border/40">
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <div className="min-w-[760px]">
              <div
                className={cn(
                  cartGrid,
                  "border-b border-border/50 bg-muted/30 px-3 py-3.5 text-sm font-medium text-muted-foreground sm:px-4"
                )}
              >
                <div className="flex justify-center">
                  <Checkbox
                    className={chk}
                    checked={headerIndeterminate ? "indeterminate" : headerChecked}
                    onCheckedChange={() => toggleAll()}
                  />
                </div>
                <div className="flex items-center tracking-wide">Sản Phẩm</div>
                <div className="text-center">Đơn Giá</div>
                <div className="text-center">Số Lượng</div>
                <div className="text-center">Số Tiền</div>
                <div className="text-center">Thao Tác</div>
              </div>

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

              <div className="flex flex-wrap items-center gap-2 border-t border-border/50 bg-muted/15 px-4 py-3 text-sm">
                <Ticket className="size-4 shrink-0 text-primary" />
                <span className="text-foreground/90">Voucher giảm đến 30k</span>
                <CartVoucherPopover>
                  <button type="button" className={cn(linkBtn, "ml-auto text-xs md:ml-0")}>
                    Xem thêm voucher
                  </button>
                </CartVoucherPopover>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 sm:px-6" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-auto max-w-[1200px] overflow-hidden shadow-sm rounded-sm border border-border/60 bg-card shadow-sm ring-1 ring-border/40">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-muted/15 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Ticket className="size-4 text-primary" />
              <span>Voucher</span>
            </div>
            <CartVoucherPopover>
              <button type="button" className={cn(linkBtn, "text-sm font-medium")}>
                Chọn hoặc nhập mã
              </button>
            </CartVoucherPopover>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox
                className={chk}
                checked={headerIndeterminate ? "indeterminate" : headerChecked}
                onCheckedChange={() => toggleAll()}
              />
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-foreground hover:text-primary"
                onClick={() => toggleAll()}
              >
                Chọn tất cả ({selected.size})
              </button>
              <button
                type="button"
                className={cn(linkBtn, "text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40")}
                disabled={selected.size === 0}
                onClick={() => deleteSelected()}
              >
                Xóa
              </button>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Tổng cộng ({selectedQty} sản phẩm): </span>
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {formatVnd(selectedSubtotal)}
                </span>
              </div>
              <Button
                type="button"
                disabled={selectedQty === 0}
                onClick={() => {
                  const ids = Array.from(selected).join(",");
                  router.push(`${ROUTES.CHECKOUT}?ids=${ids}`);
                }}
                className="h-10 min-w-[128px] cursor-pointer rounded-md bg-primary px-6 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mua hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
