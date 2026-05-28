"use client";

import { useProducts } from "@/apis/product/queries";

import { formatVnd } from "@/lib/format-currency";

import type { Product } from "@/apis/product/types";

import {
  ProductPhoto,
  ProductRating,
} from "./ProductCard";

const LIST_TITLES = [
  "Bán chạy nhất",
  "Xu hướng",
  "Mới thêm",
  "Đánh giá cao",
];

export function ProductListsSection() {
  const { data: response } = useProducts({
    limit: 3,
    sort: "newest",
  });

  const products: Product[] =
    response?.data || [];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {LIST_TITLES.map((title) => (
        <div
          key={title}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <h3 className="border-b border-sky-100 pb-3 text-base font-bold text-slate-900">
            {title}
          </h3>

          <div className="mt-1 divide-y divide-slate-100">
            {products.map((product) => {
              const currentPrice =
                product.price?.price || 0;

              const originalPrice =
                product.price?.originalPrice || 0;

              const discountPercent =
                product.price?.discountPercent || 0;

              return (
                <article
                  key={product.id}
                  className="group flex gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-sky-50/40"
                >
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-sky-50 to-white">
                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute left-1 top-1 z-10 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                        -{discountPercent}%
                      </div>
                    )}

                    <ProductPhoto
                      src={
                        product.thumbnail ||
                        product.images?.[0]
                          ?.imageUrl ||
                        ""
                      }
                      alt={product.name}
                      fill
                      className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-medium text-slate-800 transition-colors group-hover:text-sky-700">
                      {product.name}
                    </h4>

                    <ProductRating
                      rating={4.5}
                      className="mt-1"
                    />

                    <div className="mt-1 flex flex-col">
                      <span className="text-sm font-bold text-sky-700">
                        {formatVnd(currentPrice)}
                      </span>

                      {discountPercent > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatVnd(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {products.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">
                Không có sản phẩm
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}