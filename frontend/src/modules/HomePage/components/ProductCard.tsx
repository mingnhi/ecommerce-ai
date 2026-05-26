"use client";

import Image, { type ImageProps } from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format-currency";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/product-images";
import { useCart } from "@/hooks/use-cart";
import type { HomeProduct } from "@/types/catalog";
import { cn } from "@/lib/utils";

type PhotoProps = Omit<ImageProps, "src" | "onError"> & { src: string };

export function ProductPhoto({ src, alt, className, ...props }: PhotoProps) {
  const [current, setCurrent] = useState(src);
  useEffect(() => setCurrent(src), [src]);
  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      className={cn(className)}
      onError={() => {
        if (current !== PRODUCT_IMAGE_FALLBACK) setCurrent(PRODUCT_IMAGE_FALLBACK);
      }}
    />
  );
}

export function ProductRating({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < filled ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200",
          )}
        />
      ))}
    </div>
  );
}

function badgeTone(badge?: string) {
  if (badge === "Hot") return "bg-orange-500 hover:bg-orange-500";
  if (badge === "New") return "bg-emerald-500 hover:bg-emerald-500";
  return "bg-sky-500 hover:bg-sky-500";
}

type ProductCardProps = {
  product: HomeProduct;
  variant?: "grid" | "daily";
  className?: string;
};

export function ProductCard({ product, variant = "grid", className }: ProductCardProps) {
  const { addLine } = useCart();
  const isDaily = variant === "daily";
  const soldPct = Math.round((product.sold / product.stock) * 100);

  const addToCart = () =>
    addLine({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-3 sm:p-4 transition-shadow",
        isDaily
          ? "border-sky-100/90 shadow-[0_10px_36px_-16px_rgba(14,165,233,0.22)] hover:border-sky-200 hover:shadow-[0_18px_44px_-14px_rgba(14,165,233,0.32)]"
          : "border-slate-100/90 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] hover:border-sky-100 hover:shadow-[0_16px_40px_-14px_rgba(14,165,233,0.28)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-white ring-1 ring-sky-100/60",
          isDaily ? "mb-3 aspect-square" : "mb-3 aspect-square max-w-[176px] mx-auto",
        )}
      >
        {product.badge && (
          <Badge className={cn("absolute left-2 top-2 z-10 border-0 text-[10px]", badgeTone(product.badge))}>
            {product.badge}
          </Badge>
        )}
        <ProductPhoto
          src={product.image}
          alt={product.name}
          fill
          sizes={isDaily ? "(max-width: 640px) 50vw, 20vw" : "(max-width: 640px) 45vw, 176px"}
          className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className={cn("flex flex-col flex-1", isDaily && "min-h-0")}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-600/90">{product.category}</p>
        <h3
          className={cn(
            "mt-1 line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-slate-800",
            isDaily ? "min-h-10" : "min-h-[2.5rem]",
          )}
        >
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5">
          <ProductRating rating={product.rating} />
          <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
        </div>

        {!isDaily && <p className="mt-1 truncate text-xs text-slate-500">Bởi {product.vendor}</p>}

        {isDaily ? (
          <>
            <div className="mt-3 flex min-h-[28px] flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm xs:text-base font-bold tracking-tight text-sky-700 sm:text-lg">
                {formatVnd(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">{formatVnd(product.originalPrice)}</span>
              )}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span>
                  Đã bán {product.sold}/{product.stock}
                </span>
                <span className="text-sky-600">{soldPct}%</span>
              </div>
            </div>
            <Button
              className="mt-auto h-9 sm:h-10 w-full rounded-xl bg-sky-500 text-xs sm:text-sm font-semibold shadow-md shadow-sky-500/25 hover:bg-sky-600 gap-1.5"
              onClick={addToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="inline sm:hidden">Thêm</span>
              <span className="hidden sm:inline">Thêm vào giỏ</span>
            </Button>
          </>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div className="min-w-0">
              <p className="text-sm xs:text-base font-bold tracking-tight text-sky-700 sm:text-lg">{formatVnd(product.price)}</p>
              {product.originalPrice && (
                <p className="text-[10px] sm:text-xs text-slate-400 line-through truncate">{formatVnd(product.originalPrice)}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex rounded-xl border-sky-200 bg-sky-50/80 text-sky-700 hover:border-sky-500 hover:bg-sky-500 hover:text-white gap-1.5 font-medium"
              onClick={addToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Thêm
            </Button>
            <Button
              size="icon"
              className="inline-flex sm:hidden h-8 w-8 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25 items-center justify-center shrink-0 border-0"
              onClick={addToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
