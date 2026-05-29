// DealSection.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useProducts } from "@/apis/product/queries";

import { getDealEndOfDay } from "../lib";

import type { Product } from "@/apis/product/types";

import { ProductCard } from "./ProductCard";

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

export function DealSection() {

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
          <h2 className="text-xl font-bold tracking-tight  sm:text-2xl md:text-3xl text-sky-600">
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
          <ProductCard key={product.id} product={product} variant="deal" />
        ))}
      </div>
    </section>
  );
}