"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format-currency";
import { getImageUrl } from "@/lib/api-assets";
import type { ICartLine } from "@/types/cart";

interface CartItemProps {
  line: ICartLine;
  isSel: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

export function CartItem({ line, isSel, onToggle, onRemove, onQuantityChange }: CartItemProps) {
  const src = getImageUrl(line.image) ?? line.image ?? undefined;
  const lineTotal = line.price * line.quantity;

  return (
    <div className="border-b border-border/40 px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/15">
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[40px_minmax(0,1fr)_96px_120px_96px_40px] lg:items-center lg:gap-3">
        <Checkbox
          className="size-[18px] shrink-0 cursor-pointer rounded-[3px] border border-border data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500 data-[state=checked]:text-primary-foreground lg:justify-self-center hover:cursor-pointer"
          checked={isSel}
          onCheckedChange={() => onToggle(line.id)}
        />

        <div className="flex min-w-0 gap-3 lg:col-start-2">
          <div className="relative size-[72px] shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/30 sm:size-20">
            {src ? (
              <Image
                src={src}
                alt={line.name}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {line.name}
            </p>
            <p className="text-sm tabular-nums text-muted-foreground lg:hidden">
              {formatVnd(line.price)}
            </p>
          </div>
        </div>

        <p className="hidden text-center text-sm tabular-nums text-foreground lg:block">
          {formatVnd(line.price)}
        </p>

        <div className="flex items-center justify-between gap-3 pl-[84px] lg:contents">
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-border/60 bg-background shadow-xs lg:justify-self-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer rounded-none hover:bg-muted"
              onClick={() => onQuantityChange(line.id, line.quantity - 1)}
              aria-label="Giảm"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-9 border-x border-border/60 bg-muted/20 py-1.5 text-center text-sm font-medium tabular-nums">
              {line.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer rounded-none hover:bg-muted"
              onClick={() => onQuantityChange(line.id, line.quantity + 1)}
              aria-label="Tăng"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <p className="text-base font-semibold tabular-nums text-sky-600 lg:text-center lg:text-sm">
            {formatVnd(lineTotal)}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive lg:justify-self-center hover:cursor-pointer"
            onClick={() => onRemove(line.id)}
            aria-label="Xóa"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
