"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { Eye, Star, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/apis/product/types";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type PhotoProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
};

export function ProductPhoto({ src, alt, className, ...props }: PhotoProps) {
  const [error, setError] = useState(false);

  const isFallback =
    !src ||
    src.includes("example.com") ||
    src.includes("placeholder.png") ||
    error;

  if (isFallback) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-slate-50 text-slate-300",
          className,
        )}
      >
        <ImageOff className="h-8 w-8 stroke-[1.5]" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={cn(className)}
      onError={() => setError(true)}
    />
  );
}

export function ProductRating({
  rating,
  className,
  size = "md",
}: {
  rating: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const filled = Math.round(rating);
  const starSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-200",
          )}
        />
      ))}
    </div>
  );
}

type ProductCardVariant = "grid" | "deal";

type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
  compact?: boolean;
  className?: string;
};

function useProductMeta(product: Product) {
  return {
    href: `/san-pham/${product.slug}`,
    imageSrc: product.thumbnail || product.images?.[0]?.imageUrl || "",
    currentPrice: product.price?.price || 0,
    originalPrice: product.price?.originalPrice || 0,
    discount: product.price?.discountPercent || 0,
  };
}

function PriceBlock({
  currentPrice,
  originalPrice,
  discount,
  size = "md",
}: {
  currentPrice: number;
  originalPrice: number;
  discount: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "font-bold text-sky-700",
          size === "sm" ? "text-sm sm:text-base" : "text-lg",
        )}
      >
        {formatVnd(currentPrice)}
      </p>
      <p
        className={cn(
          "mt-0.5 line-through",
          size === "sm"
            ? "h-3 truncate text-[10px] sm:text-[11px]"
            : "h-4 text-xs",
          discount > 0 ? "text-slate-400" : "invisible",
        )}
      >
        {discount > 0 ? formatVnd(originalPrice) : "0"}
      </p>
    </div>
  );
}

function DealViewButton({
  href,
  compact,
}: {
  href: string;
  compact?: boolean;
}) {
  return (
    <>
      <Button
        size="sm"
        className={cn(
          "hidden shrink-0 gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 sm:flex",
          compact && "px-2.5 text-xs",
        )}
        asChild
      >
        <Link href={href}>
          <Eye className="h-4 w-4" />
          Xem chi tiết
        </Link>
      </Button>
      <Button
        size="icon"
        className="flex h-8 w-8 shrink-0 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/25 hover:bg-sky-600 sm:hidden"
        asChild
      >
        <Link href={href}>
          <Eye className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </>
  );
}

function GridProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { href, imageSrc, currentPrice, originalPrice, discount } =
    useProductMeta(product);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 sm:p-4",
        className,
      )}
    >
      <Link
        href={href}
        className="relative aspect-square shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-white"
      >
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow">
            -{discount}%
          </span>
        )}
        <ProductPhoto
          src={imageSrc}
          alt={product.name}
          fill
          className="object-contain p-3 transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex min-h-0 flex-1 flex-col pt-3">
        <p className="truncate text-xs font-medium text-sky-600">
          {product.category?.name}
        </p>

        <Link
          href={href}
          className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 hover:text-sky-700"
        >
          {product.name}
        </Link>

        <div className="mt-1 h-3.5 shrink-0">
          <ProductRating rating={4.5} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <PriceBlock
            currentPrice={currentPrice}
            originalPrice={originalPrice}
            discount={discount}
          />
          <Link
            href={href}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-sky-500 px-3 text-xs font-semibold text-white transition-all hover:bg-sky-600 hover:shadow-md"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Xem chi tiết</span>
            <span className="xs:hidden">Xem</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function DealProductCard({
  product,
  compact,
  className,
}: {
  product: Product;
  compact?: boolean;
  className?: string;
}) {
  const { href, imageSrc, currentPrice, originalPrice, discount } =
    useProductMeta(product);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={cn(
        "group h-full cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_32px_-14px_rgba(15,23,42,0.14)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-sky-50 to-slate-100",
          compact
            ? "min-h-[200px] sm:min-h-[260px]"
            : "min-h-[220px] sm:min-h-[300px]",
        )}
      >
        <ProductPhoto
          src={imageSrc}
          alt={product.name}
          fill
          sizes={
            compact
              ? "(max-width: 640px) 100vw, 33vw"
              : "(max-width: 640px) 50vw, 25vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/75 via-sky-900/15 to-transparent" />

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            -{discount}%
          </span>
        )}

        <div className="absolute inset-x-2 bottom-2 rounded-xl border border-white/20 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm sm:inset-x-3 sm:bottom-3 sm:rounded-2xl sm:p-4">
          <Link href={href}>
            <h3 className="line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-slate-900 sm:min-h-10 sm:text-sm sm:leading-5">
              {product.name}
            </h3>
          </Link>

          <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-[11px]">
            {product.category?.name}
          </p>

          <div className="mt-2.5 flex items-end justify-between gap-1.5 sm:gap-2">
            <PriceBlock
              currentPrice={currentPrice}
              originalPrice={originalPrice}
              discount={discount}
              size="sm"
            />
            <DealViewButton href={href} compact={compact} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCard({
  product,
  variant = "grid",
  compact,
  className,
}: ProductCardProps) {
  if (variant === "deal") {
    return (
      <DealProductCard
        product={product}
        compact={compact}
        className={className}
      />
    );
  }

  return <GridProductCard product={product} className={className} />;
}
