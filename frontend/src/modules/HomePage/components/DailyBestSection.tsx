"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_TABS } from "@/faker/mock-categories";
import { getDailyBestProducts } from "../lib";
import { ProductCard } from "./ProductCard";

const DAILY_TABS = ["Tất cả", "Ưu đãi hôm nay", ...CATEGORY_TABS.slice(1, 5)];

export function DailyBestSection() {
  const [dailyTab, setDailyTab] = useState("Tất cả");
  const products = useMemo(() => getDailyBestProducts(dailyTab), [dailyTab]);

  return (
    <section className="relative mb-5 overflow-hidden rounded-lg border border-sky-100/80">
      <Image src="/images/bg-slide.png" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-white/92 via-white/88 to-sky-50/75"
      />
      <div className="relative p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="shrink-0 text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">Bán chạy hôm nay</h2>
          <div className="flex gap-3 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:ml-auto [&::-webkit-scrollbar]:hidden">
            {DAILY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDailyTab(tab)}
                className={cn(
                  "shrink-0 whitespace-nowrap transition-colors hover:text-sky-600",
                  dailyTab === tab ? "font-semibold text-sky-600" : "text-slate-500",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-5 lg:mt-8 lg:flex-row lg:items-stretch lg:gap-6">
          <article className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-sky-100/90 lg:w-[280px] xl:w-[300px]">
            <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-100/70 px-5 pb-0 pt-5">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-sky-200/40 blur-2xl"
              />
              <span className="relative inline-flex rounded-full border border-sky-200/80 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
                Deal hôm nay
              </span>
              <h3 className="relative mt-4 text-xl font-semibold leading-tight tracking-tight text-slate-900">
                Công nghệ
                <span className="block text-sky-600">trong tầm tay</span>
              </h3>
              <p className="relative mt-2 max-w-[220px] text-sm leading-relaxed text-slate-600">
                Ưu đãi độc quyền, giao nhanh và bảo hành chính hãng toàn quốc.
              </p>
              <div className="relative mx-auto mt-5 flex h-40 w-full max-w-[220px] items-end justify-center sm:h-44">
                <div
                  aria-hidden
                  className="absolute inset-x-6 bottom-2 h-28 rounded-[2rem] bg-gradient-to-t from-sky-100/90 to-sky-50/40"
                />
                <Image
                  src="/images/phone.png"
                  alt="Smartphone nổi bật"
                  width={220}
                  height={220}
                  className="relative z-10 h-full w-auto object-contain drop-shadow-[0_18px_32px_rgba(14,165,233,0.28)]"
                />
              </div>
            </div>
            <div className="border-t border-sky-50 p-5">
              <Button
                asChild
                className="h-11 w-full rounded-xl bg-sky-500 font-semibold shadow-md shadow-sky-500/20 transition-colors hover:bg-sky-600"
              >
                <Link href="/">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </article>
          <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} variant="daily" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
