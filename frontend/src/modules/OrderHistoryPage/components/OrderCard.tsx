"use client";

import Image from "next/image";
import { Package, Calendar, ChevronRight } from "lucide-react";
import { IOrder } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface OrderCardProps {
  order: IOrder;
}

const statusConfig = {
  pending: { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800 border-blue-200" },
  shipping: { label: "Đang giao", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  delivered: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-800 border-rose-200" },
  returned: { label: "Trả hàng/Hoàn tiền", color: "bg-red-100 text-red-800 border-red-200" },
};

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status];
  const orderDate = dayjs(order.createdAt).format("DD/MM/YYYY HH:mm");

  return (
    <div className="group overflow-hidden rounded-sm border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Package className="size-4 text-primary" />
            <span>Mã đơn: <span className="uppercase">{order.orderNumber}</span></span>
          </div>
          <div className="hidden h-4 w-px bg-border/80 sm:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{orderDate}</span>
          </div>
        </div>
        <div className="mt-2 flex w-full items-center justify-between sm:mt-0 sm:w-auto sm:justify-end">
          <Badge variant="outline" className={cn("border font-medium px-2.5 py-0.5", status.color)}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Products */}
      <div className="divide-y divide-border/40 px-5">
        {order.products.map((product) => (
          <div key={product.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/20">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="size-8 opacity-20" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground hover:text-primary transition-colors cursor-pointer">
                {product.name}
              </h3>
              {product.variantLabel && (
                <p className="mt-1.5 inline-flex w-fit rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                  Phân loại: {product.variantLabel}
                </p>
              )}
              <div className="mt-2 font-medium text-muted-foreground sm:hidden">
                x{product.quantity}
              </div>
            </div>
            <div className="hidden flex-col items-center justify-center px-6 sm:flex">
              <span className="text-sm font-medium text-muted-foreground">Số lượng</span>
              <span className="mt-1 text-base font-semibold text-foreground">{product.quantity}</span>
            </div>
            <div className="flex flex-col items-end justify-center sm:min-w-[120px]">
              <span className="text-sm font-medium text-muted-foreground sm:hidden">Đơn giá</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs font-medium text-muted-foreground line-through">
                  {formatVnd(product.originalPrice)}
                </span>
              )}
              <span className="text-base font-bold text-foreground">
                {formatVnd(product.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 bg-muted/10 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-right sm:text-left">
            <div className="text-sm text-muted-foreground">
              Tổng tiền thanh toán
            </div>
            <div className="text-2xl font-bold tracking-tight text-primary">
              {formatVnd(order.total)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-background hover:bg-muted sm:flex-none border-border/80 font-medium"
            >
              Xem chi tiết
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none font-medium shadow-md shadow-primary/20"
            >
              Mua lại
              <ChevronRight className="ml-1.5 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
