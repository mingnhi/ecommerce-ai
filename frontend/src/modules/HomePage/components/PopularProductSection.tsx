"use client";

import { useMemo, useState } from "react";
import { CATEGORY_TABS } from "@/faker/mock-categories";
import { cn } from "@/lib/utils";
import { getPopularProducts } from "../lib";
import { ProductCard } from "./ProductCard";

const POPULAR_TABS = ["Tất cả", ...CATEGORY_TABS.slice(1, 6)];

export function PopularProductSection() {
  const [popularTab, setPopularTab] = useState("Tất cả");
  const products = useMemo(() => getPopularProducts(popularTab), [popularTab]);

  return (
    <section>
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="shrink-0 text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">Sản phẩm phổ biến</h2>
        <div className="flex gap-3 overflow-x-auto text-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:ml-auto [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
          {POPULAR_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPopularTab(tab)}
              className={cn(
                "shrink-0 whitespace-nowrap transition-colors hover:text-sky-600 text-[13px] sm:text-sm cursor-pointer",
                popularTab === tab ? "font-semibold text-sky-600" : "text-slate-500",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </section>
  );
}
