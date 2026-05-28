// DealSection.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useProducts } from "@/apis/product/queries";

import { getDealEndOfDay } from "../lib";

import type { Product } from "@/apis/product/types";

import { ProductPhoto } from "./ProductCard";

import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";

import { useCart } from "@/hooks/use-cart";

import { formatVnd } from "@/lib/format-currency";

function CountdownBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-[46px] flex-col items-center rounded-xl border border-sky-100 bg-white px-1.5 py-1 shadow-sm xs:min-w-[52px] xs:px-2 xs:py-1.5 sm:min-w-[56px] sm:px-2.5 sm:py-2">
      <span className="text-sm font-bold tabular-nums text-sky-700 xs:text-base sm:text-lg">
        {String(value).padStart(2, "0")}
      </span>

      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500 xs:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function DealCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  const currentPrice =
    product.price?.price || 0;

  const originalPrice =
    product.price?.originalPrice || 0;

  const discountPercent =
    product.price?.discountPercent || 0;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_32px_-14px_rgba(15,23,42,0.14)]"
    >
      <div className="relative aspect-[3/4] min-h-[220px] overflow-hidden bg-gradient-to-b from-sky-50 to-slate-100 sm:min-h-[300px]">
        <ProductPhoto
          src={
            product.thumbnail ||
            product.images?.[0]
              ?.imageUrl ||
            ""
          }
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/75 via-sky-900/15 to-transparent" />

        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-sky-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute inset-x-2 bottom-2 rounded-xl border border-white/20 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:rounded-2xl sm:p-4">
          <h3 className="line-clamp-2 text-xs font-semibold text-slate-900 sm:text-sm">
            {product.name}
          </h3>

          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
            {product.category?.name}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-sky-700 sm:text-base">
                {formatVnd(currentPrice)}
              </p>

              {discountPercent > 0 && (
                <p className="truncate text-[10px] text-slate-400 line-through sm:text-[11px]">
                  {formatVnd(originalPrice)}
                </p>
              )}
            </div>

            <Button
              size="sm"
              className="hidden shrink-0 cursor-pointer gap-1.5 rounded-xl bg-sky-500 px-3 hover:bg-sky-600 sm:flex"
              onClick={onAdd}
            >
              <ShoppingCart className="h-4 w-4" />
              Thêm
            </Button>

            <Button
              size="icon"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-0 bg-sky-500 text-white shadow-md shadow-sky-500/25 hover:bg-sky-600 sm:hidden"
              onClick={onAdd}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function DealSection() {
  const { addLine } = useCart();

  const { data: response } =
    useProducts({
      limit: 4,
      sort: "newest",
    });

  const products: Product[] =
    response?.data || [];

  const target = useMemo(
    () => getDealEndOfDay(),
    [],
  );

  const calc = () => {
    const diff = Math.max(
      0,
      target.getTime() - Date.now(),
    );

    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(
        (diff / 3600000) % 24,
      ),
      mins: Math.floor(
        (diff / 60000) % 60,
      ),
      secs: Math.floor(
        (diff / 1000) % 60,
      ),
    };
  };

  const [countdown, setCountdown] =
    useState(calc);

  useEffect(() => {
    const id = setInterval(
      () => setCountdown(calc),
      1000,
    );

    return () => clearInterval(id);
  }, [target]);

  return (
    <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
            Ưu đãi trong ngày
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Kết thúc lúc 23:59 hôm nay
          </p>
        </div>

        <div className="flex w-fit gap-1.5 rounded-2xl bg-sky-50/80 p-1.5 ring-1 ring-sky-100 xs:gap-2 xs:p-2">
          <CountdownBox
            label="Ngày"
            value={countdown.days}
          />

          <CountdownBox
            label="Giờ"
            value={countdown.hours}
          />

          <CountdownBox
            label="Phút"
            value={countdown.mins}
          />

          <CountdownBox
            label="Giây"
            value={countdown.secs}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <DealCard
            key={product.id}
            product={product}
            onAdd={() =>
              addLine({
                productId: product.id,
                name: product.name,
                price:
                  product.price?.price || 0,
                quantity: 1,
                image:
                  product.thumbnail ||
                  product.images?.[0]
                    ?.imageUrl ||
                  "",
              })
            }
          />
        ))}
      </div>
    </section>
  );
}