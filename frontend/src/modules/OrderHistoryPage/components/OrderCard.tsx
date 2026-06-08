"use client";

import Image from "next/image";
import { Package, Calendar, ChevronRight, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { IOrder } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

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
    <div className="group overflow-hidden rounded-sm border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:border-sky-500/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex min-w-0 items-center gap-2 font-medium text-foreground">
            <Package className="size-4 shrink-0 text-sky-500" />
            <span className="shrink-0 text-muted-foreground">Mã đơn:</span>
            <span className="break-all font-mono text-xs uppercase sm:text-sm">
              {order.id}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(order.id, "Đã sao chép mã đơn hàng")}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sky-50 hover:text-sky-600 cursor-pointer"
              aria-label="Sao chép mã đơn hàng"
            >
              <Copy className="size-4" />
            </button>
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
              <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground hover:text-sky-600 transition-colors cursor-pointer">
                {product.name}
              </h3>

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
            <div className="text-xl font-bold tracking-tight text-sky-500">
              {formatVnd(order.total)}
            </div>
          </div>
          <Button
            asChild
            className="w-full bg-sky-500 font-medium text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 hover:cursor-pointer sm:w-auto"
          >
            <Link href={ROUTES.HOME}>
              Mua lại
              <ChevronRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
