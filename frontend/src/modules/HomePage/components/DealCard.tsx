"use client";

import { motion } from "framer-motion";

import { ShoppingCart } from "lucide-react";

import { Product } from "@/apis/product/types";

import { Button } from "@/components/ui/button";

import { useCart } from "@/hooks/use-cart";

import { formatVnd } from "@/lib/format-currency";

import { ProductPhoto } from "./ProductCard";

type DealCardProps = {
  product: Product;
};

export function DealCard({
  product,
}: DealCardProps) {
  const { addLine } = useCart();

  const currentPrice =
    product.price?.price || 0;

  const originalPrice =
    product.price?.originalPrice || 0;

  const discount =
    product.price?.discountPercent || 0;

  const addToCart = () => {
    addLine({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image:
        product.thumbnail ||
        product.images?.[0]?.imageUrl ||
        "",
    });
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_32px_-14px_rgba(15,23,42,0.14)]"
    >
      <div className="relative aspect-[3/4] min-h-[220px] overflow-hidden bg-gradient-to-b from-sky-50 to-slate-100 sm:min-h-[300px]">
        <ProductPhoto
          src={
            product.thumbnail ||
            product.images?.[0]?.imageUrl ||
            ""
          }
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/75 via-sky-900/15 to-transparent" />

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            -{discount}%
          </span>
        )}

        <div className="absolute inset-x-2 bottom-2 rounded-xl border border-white/20 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:rounded-2xl sm:p-4">
          <h3 className="line-clamp-2 text-xs font-semibold text-slate-900 sm:text-sm">
            {product.name}
          </h3>

          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
            {product.category.name}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-sky-700 sm:text-base">
                {formatVnd(currentPrice)}
              </p>

              {discount > 0 && (
                <p className="truncate text-[10px] text-slate-400 line-through sm:text-[11px]">
                  {formatVnd(originalPrice)}
                </p>
              )}
            </div>

            <Button
              size="sm"
              className="hidden shrink-0 gap-1.5 rounded-xl bg-sky-500 px-3 hover:bg-sky-600 sm:flex"
              onClick={addToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Thêm
            </Button>

            <Button
              size="icon"
              className="flex h-8 w-8 shrink-0 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/25 hover:bg-sky-600 sm:hidden"
              onClick={addToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}