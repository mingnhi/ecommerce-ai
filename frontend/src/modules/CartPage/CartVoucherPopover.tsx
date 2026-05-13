"use client";

import { useState, type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MOCK_VOUCHERS,
  formatVoucherDiscount,
  formatVoucherMinOrder,
} from "@/faker/mock-vouchers";

export function CartVoucherPopover({ children }: { children: ReactNode }) {
  const [code, setCode] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(MOCK_VOUCHERS[0]?.id);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={10}
        className="w-[min(calc(100vw-1.5rem),380px)] border-border/80 p-0 shadow-lg"
      >
        
        <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
          <Label htmlFor="cart-voucher-code" className="text-xs font-normal text-muted-foreground">
            Mã Voucher
          </Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="cart-voucher-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Nhập mã"
              className="h-9 flex-1 cursor-text bg-background text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!code.trim()}
              className="h-9 shrink-0 cursor-pointer px-3 text-xs font-semibold"
            >
              ÁP DỤNG
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[260px]">
          <RadioGroup
            value={selectedId}
            onValueChange={setSelectedId}
            className="grid gap-0 p-0"
          >
            {MOCK_VOUCHERS.map((v) => (
              <div
                key={v.id}
                role="presentation"
                className="flex cursor-pointer items-stretch gap-0 border-b border-border/50 px-3 py-3 transition-colors last:border-b-0 hover:bg-muted/50 sm:px-4"
                onClick={() => setSelectedId(v.id)}
              >
                <div className="flex w-[52px] shrink-0 flex-col items-center justify-center border-r border-dashed border-border pr-3">
                  <div className="flex size-11 items-center justify-center rounded-full border-2 border-primary/25 bg-primary/5">
                    <ShoppingBag className="size-5 text-primary" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1 pl-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatVoucherDiscount(v.discountAmount)}
                  </p>
                  <p className="text-xs text-foreground/80">{formatVoucherMinOrder(v.minOrderAmount)}</p>
                  <span className="inline-flex w-fit rounded border border-primary/35 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {v.tag}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    HSD: {v.expiryLabel}{" "}
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Điều kiện
                    </button>
                  </p>
                </div>
                <div className="flex w-14 shrink-0 flex-col items-end justify-between gap-2 pl-1">
                  <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                    × {v.stock}
                  </span>
                  <RadioGroupItem value={v.id} className="cursor-pointer" />
                </div>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
