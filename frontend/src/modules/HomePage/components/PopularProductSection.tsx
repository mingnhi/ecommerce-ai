"use client";

import { useMemo, useState } from "react";

import { useProducts } from "@/apis/product/queries";
import { useCategories } from "@/apis/category/queries";

import { cn } from "@/lib/utils";

import { ProductCard } from "./ProductCard";

import type { Product } from "@/apis/product/types";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function PopularProductSection() {
  const [activeCategory, setActiveCategory] =
    useState<string>("");

  const { data: categoryResponse } =
    useCategories({
      type: "flat",
    });

  const categories: Category[] =
    categoryResponse?.data?.categories || [];

  const query = useMemo(
    () => ({
      limit: 10,
      sort: "newest" as const,

      ...(activeCategory && {
        categoryId: activeCategory,
      }),
    }),
    [activeCategory]
  );

  const { data: response } =
    useProducts(query);

  const products: Product[] =
    response?.data || [];

  return (
    <section>
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="shrink-0 text-xl font-semibold text-sky-600 sm:text-2xl md:text-3xl">
          Sản phẩm phổ biến
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-1 text-sm sm:pb-0">
          <button
            onClick={() =>
              setActiveCategory("")
            }
            className={cn(
              "shrink-0 whitespace-nowrap text-[13px] transition-colors hover:text-sky-600 sm:text-sm cursor-pointer",
              activeCategory === ""
                ? "font-semibold text-sky-600"
                : "text-slate-500"
            )}
          >
            Tất cả
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setActiveCategory(
                  category.id
                )
              }
              className={cn(
                "shrink-0 whitespace-nowrap text-[13px] transition-colors hover:text-sky-600 sm:text-sm cursor-pointer",
                activeCategory ===
                  category.id
                  ? "font-semibold text-sky-600"
                  : "text-slate-500"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}