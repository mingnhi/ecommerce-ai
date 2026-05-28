"use client";

import { useEffect, useMemo, useState } from "react";

import { useProducts } from "@/apis/product/queries";

import { getDealEndOfDay } from "../lib";

import { DealCard } from "./DealCard";
import type { Product } from "@/apis/product/types";

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

function DealCard({ product, onAdd }: { product: HomeProduct; onAdd: () => void }) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_32px_-14px_rgba(15,23,42,0.14)] cursor-pointer"
    >
      <div className="relative aspect-[3/4] min-h-[220px] sm:min-h-[300px] overflow-hidden bg-gradient-to-b from-sky-50 to-slate-100">
        <ProductPhoto
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/75 via-sky-900/15 to-transparent" />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-sky-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            -{discount}%
          </span>
        )}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 rounded-xl sm:rounded-2xl border border-white/20 bg-white/95 p-2.5 sm:p-4 shadow-lg backdrop-blur-sm">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500">Bởi {product.vendor}</p>
          <div className="mt-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-sky-700">{formatVnd(product.price)}</p>
              {product.originalPrice && (
                <p className="text-[10px] sm:text-[11px] text-slate-400 line-through truncate">{formatVnd(product.originalPrice)}</p>
              )}
            </div>
            <Button size="sm" className="hidden sm:flex shrink-0 rounded-xl bg-sky-500 px-3 hover:bg-sky-600 gap-1.5 cursor-pointer" onClick={onAdd}>
              <ShoppingCart className="h-4 w-4" />
              Thêm
            </Button>
            <Button
              size="icon"
              className="flex sm:hidden h-8 w-8 shrink-0 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25 items-center justify-center shrink-0 border-0 cursor-pointer"
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
  const products = getDealProducts();
  const target = useMemo(() => getDealEndOfDay(), []);
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      mins: Math.floor((diff / 60000) % 60),
      secs: Math.floor((diff / 1000) % 60),
    };
  };
  const [countdown, setCountdown] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setCountdown(calc), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <section className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Ưu đãi trong ngày</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Kết thúc lúc 23:59 hôm nay</p>
        </div>
        <div className="flex gap-1.5 xs:gap-2 rounded-2xl bg-sky-50/80 p-1.5 xs:p-2 ring-1 ring-sky-100 w-fit">
          <CountdownBox label="Ngày" value={countdown.days} />
          <CountdownBox label="Giờ" value={countdown.hours} />
          <CountdownBox label="Phút" value={countdown.mins} />
          <CountdownBox label="Giây" value={countdown.secs} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <DealCard
            key={product.productId}
            product={product}
            onAdd={() =>
              addLine({
                productId: product.productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
              })
            }
          />
        ))}
      </div>
    </section>
  );
}
