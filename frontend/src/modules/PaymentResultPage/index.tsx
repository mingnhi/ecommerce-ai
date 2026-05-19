"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatVnd } from "@/lib/format-currency";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { usePaymentResultOrder } from "@/hooks/use-payment-result-order";
import type { IOrderProduct, OrderStatus } from "@/types/order";
import { PaymentResultSkeleton } from "./components/Skeleton";
import { SuccessFireworks } from "./components/SuccessFireworks";

type PaymentResultPageProps = {
  params: Promise<{ orderId: string }>;
};

type ResultVariant = "success" | "pending" | "failed";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: ResultVariant;
    headline: string;
    description: string;
    badgeClass: string;
  }
> = {
  pending: {
    label: "Chờ thanh toán",
    variant: "pending",
    headline: "Đơn hàng đang chờ xác nhận",
    description: "Chúng tôi đã ghi nhận đơn và sẽ cập nhật trạng thái sớm.",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    variant: "pending",
    headline: "Đơn hàng đang chờ xác nhận",
    description: "Đơn đã được xác nhận và đang chuẩn bị xử lý.",
    badgeClass: "bg-blue-50 text-blue-900 border-blue-200",
  },
  shipping: {
    label: "Đang giao",
    variant: "success",
    headline: "Đặt hàng thành công",
    description: "Đơn hàng đang được giao. Bạn có thể theo dõi trong lịch sử đơn.",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  delivered: {
    label: "Hoàn thành",
    variant: "success",
    headline: "Đặt hàng thành công",
    description: "Cảm ơn bạn. Đơn hàng đã được xử lý thành công.",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  cancelled: {
    label: "Đã huỷ",
    variant: "failed",
    headline: "Đơn hàng đã huỷ",
    description: "Đơn không còn hiệu lực. Bạn có thể đặt lại bất cứ lúc nào.",
    badgeClass: "bg-rose-50 text-rose-900 border-rose-200",
  },
  returned: {
    label: "Đã hoàn tiền",
    variant: "failed",
    headline: "Đơn hàng đã hoàn tiền",
    description: "Số tiền sẽ được hoàn theo chính sách thanh toán của cửa hàng.",
    badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
};

const variantIcon: Record<ResultVariant, typeof Check> = {
  success: Check,
  pending: Clock,
  failed: X,
};

const variantIconWrap: Record<ResultVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function PaymentResultPage({ params }: PaymentResultPageProps) {
  const { orderId } = use(params);
  const { order, polling } = usePaymentResultOrder(orderId);

  if (!order) {
    return <PaymentResultSkeleton />;
  }

  const config = statusConfig[order.status];
  const Icon = variantIcon[config.variant];

  return (
    <div className="relative py-6 sm:py-8">
      {config.variant === "success" && <SuccessFireworks />}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <header className="mb-8 flex gap-4 sm:gap-5">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-sm border",
              variantIconWrap[config.variant],
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {config.headline}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {config.description}
            </p>
            {config.variant === "pending" && polling && (
              <p className="text-xs text-muted-foreground">Đang cập nhật trạng thái…</p>
            )}
          </div>
        </header>

        <div className="overflow-hidden rounded-sm border border-border/60 bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
              <p className="mt-0.5 font-mono text-sm font-medium uppercase tracking-wide text-foreground">
                {order.orderNumber}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("border font-medium", config.badgeClass)}
            >
              {config.label}
            </Badge>
          </div>

          <dl className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <div>
              <dt className="text-xs text-muted-foreground">Trạng thái</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{config.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tổng thanh toán</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-sky-600">
                {formatVnd(order.total)}
              </dd>
            </div>
          </dl>

          <Separator className="bg-border/50" />

          <section className="px-5 py-5 sm:px-6">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sản phẩm
            </h2>
            <ul className="mt-4 divide-y divide-border/40">
              {order.products.map((product: IOrderProduct) => (
                <li key={product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-sm border border-border/50 bg-muted/30 sm:size-16">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/40">
                        <Package className="size-5" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatVnd(product.price)} · SL {product.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums text-foreground sm:text-right">
                      {formatVnd(product.price * product.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col-reverse gap-2 border-t border-border/50 bg-muted/15 px-5 py-5 sm:flex-row sm:px-6">
            <Button variant="outline" className="h-11 flex-1 rounded-sm" asChild>
              <Link href={ROUTES.HOME}>
                Tiếp tục mua sắm
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button className="h-11 flex-1 rounded-sm" asChild>
              <Link href={ROUTES.ORDER_HISTORY}>Xem đơn hàng</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
