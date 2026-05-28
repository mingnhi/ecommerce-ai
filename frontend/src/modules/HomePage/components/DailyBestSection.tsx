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
];

export function DailyBestSection() {
  const [dailyTab, setDailyTab] = useState("Tất cả");

  const sort: "price_desc" | "newest" =
    dailyTab === "Ưu đãi hôm nay"
      ? "price_desc"
      : "newest";

  const query = useMemo(
    () => ({
      limit: 8,
      sort,
      ...(dailyTab !== "Tất cả" &&
        dailyTab !== "Ưu đãi hôm nay" && {
          search: dailyTab,
        }),
    }),
    [dailyTab, sort]
  );

  const { data: response } = useProducts(query);

  const products: Product[] =
  response?.data || [];

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

          <div className="flex gap-3 overflow-x-auto pb-1 text-sm sm:pb-0">
            {DAILY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setDailyTab(tab)}
                className={cn(
                  "shrink-0 whitespace-nowrap text-[13px] transition-colors hover:text-sky-600 sm:text-sm cursor-pointer",
                  dailyTab === tab
                    ? "font-semibold text-sky-600"
                    : "text-slate-500"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:mt-8 xl:flex-row xl:items-stretch xl:gap-6">
          <article className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-sky-100/90 sm:flex-row xl:w-[300px] xl:flex-col">
            <div className="flex flex-1 flex-col justify-center p-6">
              <span className="mb-2 inline-flex w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                Flash Sale
              </span>

              <h3 className="text-2xl font-bold leading-tight text-slate-900">
                Ưu đãi cực sốc hôm nay
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Hàng loạt sản phẩm công nghệ đang giảm giá mạnh.
              </p>
            </div>

            <div className="p-5 pt-0 sm:hidden xl:block xl:p-6 xl:pt-0">
              <Button
                asChild
                className="h-11 w-full rounded-xl bg-sky-500 font-semibold"
              >
                <Link href="/san-pham">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </article>

          <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="daily"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}