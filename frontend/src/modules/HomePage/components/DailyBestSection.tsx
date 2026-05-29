"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/apis/product/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/apis/product/types";

const DAILY_TABS = [
  "Tất cả",
  "Ưu đãi hôm nay",
  "Điện thoại",
  "Laptop",
  "Tai nghe",
] as const;

const PRODUCT_LIMIT = 3;

function DailyPromoCard() {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-sky-100/90">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-sky-200/40 blur-2xl"
      />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <span className="inline-flex w-fit rounded-full border border-sky-200/80 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
          Deal hôm nay
        </span>

        <h3 className="mt-3 text-lg font-semibold leading-tight tracking-tight text-slate-900 sm:text-xl">
          Công nghệ
          <span className="block text-sky-600">trong tầm tay</span>
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
          Ưu đãi độc quyền, giao nhanh và bảo hành chính hãng toàn quốc.
        </p>

        <div className="relative mx-auto my-5 flex w-full max-w-[200px] flex-1 items-center justify-center sm:max-w-[220px]">
          <div
            aria-hidden
            className="absolute inset-x-4 bottom-0 h-20 rounded-4xl bg-gradient-to-t from-sky-100/70 to-transparent"
          />
          <div className="relative h-36 w-full sm:h-40">
            <Image
              src="/images/phone.png"
              alt="Smartphone nổi bật"
              fill
              sizes="220px"
              className="object-contain drop-shadow-[0_16px_28px_rgba(14,165,233,0.25)]"
            />
          </div>
        </div>

        <Button
          asChild
          className="mt-auto h-11 w-full rounded-xl bg-sky-500 font-semibold shadow-md shadow-sky-500/20 transition-colors hover:bg-sky-600"
        >
          <Link href="/">
            Khám phá ngay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function DailyBestSection() {
  const [dailyTab, setDailyTab] = useState<(typeof DAILY_TABS)[number]>("Tất cả");

  const sort: "price_desc" | "newest" =
    dailyTab === "Ưu đãi hôm nay" ? "price_desc" : "newest";

  const query = useMemo(
    () => ({
      limit: PRODUCT_LIMIT,
      sort,
      ...(dailyTab !== "Tất cả" &&
        dailyTab !== "Ưu đãi hôm nay" && {
          search: dailyTab,
        }),
    }),
    [dailyTab, sort],
  );

  const { data: response } = useProducts(query);
  const products: Product[] = (response?.data || []).slice(0, PRODUCT_LIMIT);

  return (
    <section className="relative mb-5 overflow-hidden rounded-lg border border-sky-100/80">
      <Image
        src="/images/bg-slide.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />

      <div className="absolute inset-0 bg-gradient-to-br from-white/92 via-white/88 to-sky-50/75" />

      <div className="relative p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="shrink-0 text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">
            Bán chạy hôm nay
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-1 sm:pb-0">
            {DAILY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDailyTab(tab)}
                className={cn(
                  "shrink-0 cursor-pointer whitespace-nowrap text-[13px] transition-colors hover:text-sky-600 sm:text-sm",
                  dailyTab === tab ? "font-semibold text-sky-600" : "text-slate-500",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:mt-8 xl:grid-cols-[272px_minmax(0,1fr)] xl:items-stretch xl:gap-5">
          <DailyPromoCard />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant="deal" compact className="h-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
