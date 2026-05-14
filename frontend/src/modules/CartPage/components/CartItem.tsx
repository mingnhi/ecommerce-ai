"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format-currency";
import { getImageUrl } from "@/lib/api-assets";
import { cn } from "@/lib/utils";
import type { ICartLine } from "@/types/cart";

const cartGrid =
  "grid grid-cols-[48px_minmax(220px,1fr)_112px_128px_112px_88px] items-center gap-x-3";

const chk =
  "size-[18px] cursor-pointer rounded-[3px] border border-[#d0d0d0] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";

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
    <div
      className={cn(
        cartGrid,
        "border-b border-border/40 px-3 py-4 transition-colors last:border-b-0 hover:bg-muted/20 sm:px-4"
      )}
    >
      <div className="flex justify-center">
        <Checkbox
          className={chk}
          checked={isSel}
          onCheckedChange={() => onToggle(line.id)}
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
            onClick={() => onQuantityChange(line.id, line.quantity - 1)}
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
            onClick={() => onQuantityChange(line.id, line.quantity + 1)}
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
          onClick={() => onRemove(line.id)}
          aria-label="Xóa"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
