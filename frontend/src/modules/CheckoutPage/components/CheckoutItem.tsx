"use client";

import Image from "next/image";
import { formatVnd } from "@/lib/format-currency";
import { getImageUrl } from "@/lib/api-assets";

interface CheckoutItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
  };
}

export function CheckoutItem({ item }: CheckoutItemProps) {
  const src = getImageUrl(item.image) ?? item.image ?? undefined;
  
  return (
    <div className="px-6 py-4 border-b border-border/40">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="col-span-1 md:col-span-6 flex gap-3">
          <div className="size-10 flex-shrink-0 bg-muted border border-border/60 rounded-sm overflow-hidden relative">
            {src && (
              <Image
                src={src}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="flex flex-col justify-center max-w-[250px] md:max-w-none">
            <p className="line-clamp-1 text-sm text-foreground mb-1">
              {item.name}
            </p>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 text-left md:text-center flex items-center justify-between md:justify-center">
          <span className="md:hidden text-muted-foreground text-sm">Đơn giá:</span>
          <span className="text-sm text-foreground">{formatVnd(item.price)}</span>
        </div>
        <div className="col-span-1 md:col-span-2 text-left md:text-center flex items-center justify-between md:justify-center">
          <span className="md:hidden text-muted-foreground text-sm">Số lượng:</span>
          <span className="text-sm text-foreground">{item.quantity}</span>
        </div>
        <div className="col-span-1 md:col-span-2 text-right font-medium text-sm text-foreground">
          <span className="md:hidden text-muted-foreground float-left font-normal">Thành tiền:</span>
          {formatVnd(item.price * item.quantity)}
        </div>
      </div>
    </div>
  );
}
