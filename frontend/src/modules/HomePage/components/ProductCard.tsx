"use client";

import Image, { type ImageProps } from "next/image";
import Link from "next/link";

import {
  ShoppingCart,
  Star,
} from "lucide-react";

import { motion } from "framer-motion";

import { useCart } from "@/hooks/use-cart";

import { formatVnd } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

import { Product } from "@/apis/product/types";

type PhotoProps = Omit<
  ImageProps,
  "src" | "onError"
> & {
  src: string;
};

export function ProductPhoto({
  src,
  alt,
  className,
  ...props
}: PhotoProps) {
  const imageSrc =
    !src ||
    src.includes("example.com")
      ? "/images/placeholder.png"
      : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      className={cn(className)}
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
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-3 transition-shadow sm:p-4",
        isDaily
          ? "border-sky-100"
          : "border-slate-100"
      )}
    >
      <Link
        href={`/san-pham/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-white"
      >
        {discount > 0 && (
          <div className="absolute left-2 top-2 z-10 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow">
            -{discount}%
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
          className="object-contain p-3 transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs font-medium text-sky-600">
          {product.category.name}
        </p>

        <Link
          href={`/san-pham/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold leading-tight hover:text-sky-700"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-1">
          <ProductRating rating={4.5} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-lg font-bold text-sky-700">
              {formatVnd(currentPrice)}
            </p>

            {discount > 0 && (
              <p className="text-xs line-through text-slate-400">
                {formatVnd(originalPrice)}
              </p>
            )}
          </div>

          <button
            onClick={addToCart}
            className="rounded-xl bg-sky-500 p-2.5 text-white transition-colors hover:bg-sky-600"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
