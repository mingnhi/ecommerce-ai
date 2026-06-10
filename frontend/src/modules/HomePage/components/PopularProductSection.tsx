"use client";

import { useMemo, useState } from "react";

import { useProducts } from "@/apis/product/queries";
import { useCategories } from "@/apis/category/queries";

import { cn } from "@/lib/utils";

import { ProductCard } from "./ProductCard";

import type { Product } from "@/apis/product/types";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ChevronRight } from "lucide-react";

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
         <Link
        href={ROUTES.PRODUCTS}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg  px-4  text-sm font-medium text-sky-600 transition-colors"
      >
        Xem tất cả
        <ChevronRight className="size-4" />
      </Link>
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
