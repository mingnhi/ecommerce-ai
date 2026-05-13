"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Ticket, Trash2, Truck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { formatVnd } from "@/lib/format-currency";
import { getImageUrl } from "@/lib/api-assets";
import { siteConfig } from "@/configs/site";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import type { ICartLine } from "@/types/cart";
import { CartVoucherPopover } from "./CartVoucherPopover";

const cartGrid =
  "grid grid-cols-[48px_minmax(220px,1fr)_112px_128px_112px_88px] items-center gap-x-3";

const chk =
  "size-[18px] cursor-pointer rounded-[3px] border border-[#d0d0d0] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";

const linkBtn = "cursor-pointer text-primary hover:underline";

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
    return (
      <div className="min-h-[calc(100vh-66px)] bg-muted/25">
        <div className="border-b border-border/60 bg-background">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
            <Link href={ROUTES.HOME} className="cursor-pointer text-lg font-semibold text-primary">
              {siteConfig.name}
            </Link>
            <span className="text-lg text-muted-foreground/50">|</span>
            <span className="text-lg font-medium text-primary">Giỏ hàng</span>
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-4 py-20 text-center sm:px-6">
          <p className="text-base text-muted-foreground">Chưa có sản phẩm trong giỏ hàng.</p>
          <Button
            asChild
            className="mt-8 cursor-pointer rounded-md bg-primary px-10 font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Link href={ROUTES.HOME}>Mua sắm ngay</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-66px)] bg-muted/25 py-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-border/40">
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

              {items.map((line: ICartLine) => {
                const src = getImageUrl(line.image) ?? line.image ?? undefined;
                const lineTotal = line.price * line.quantity;
                const isSel = selected.has(line.id);
                return (
                  <div
                    key={line.id}
                    className={cn(
                      cartGrid,
                      "border-b border-border/40 px-3 py-4 transition-colors last:border-b-0 hover:bg-muted/20 sm:px-4"
                    )}
                  >
                    <div className="flex justify-center">
                      <Checkbox
                        className={chk}
                        checked={isSel}
                        onCheckedChange={() => toggleLine(line.id)}
                      />
                    </div>
                    <div className="flex min-w-0 gap-3 items-center">
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/40 sm:h-20 sm:w-20">
                        {src ? (
                          <Image
                            src={src}
                            alt={line.name}
                            width={80}
                            height={80}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                          {line.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-center text-sm tabular-nums text-foreground">
                      {formatVnd(line.price)}
                    </div>
                    <div className="flex justify-center">
                      <div className="inline-flex items-center overflow-hidden rounded-md border border-border/60 bg-background shadow-xs">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer rounded-none text-muted-foreground hover:bg-muted"
                          onClick={() => setLineQuantity(line.id, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="min-w-9 border-x border-border/60 bg-muted/20 py-1 text-center text-sm tabular-nums text-foreground">
                          {line.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer rounded-none text-muted-foreground hover:bg-muted"
                          onClick={() => setLineQuantity(line.id, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-center text-sm font-semibold tabular-nums text-primary">
                      {formatVnd(lineTotal)}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeLine(line.id)}
                        aria-label="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center gap-2 border-t border-border/50 bg-muted/15 px-4 py-3 text-sm">
                <Ticket className="size-4 shrink-0 text-primary" />
                <span className="text-foreground/90">Voucher giảm đến 30k</span>
                <CartVoucherPopover>
                  <button type="button" className={cn(linkBtn, "ml-auto text-xs md:ml-0")}>
                    Xem thêm voucher
                  </button>
                </CartVoucherPopover>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-3 text-sm">
                <Truck className="size-4 shrink-0 text-emerald-600" />
                <span className="text-foreground/90">Giảm phí vận chuyển đơn từ 0đ</span>
                <button type="button" className={cn(linkBtn, "ml-auto text-xs md:ml-0")}>
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 sm:px-6" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-auto max-w-[1200px] overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-border/40">
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
                Chọn tất cả ({items.length})
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
