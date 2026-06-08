"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useProductBySlug } from "@/apis/product/queries";
import { useCartContext } from "@/contexts";
import type { Product, ProductVariant } from "@/apis/product/types";
import { ProductPhoto } from "@/modules/HomePage/components/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/format-currency";
import { getEnvelopeData } from "@/lib/api-response";
import { ProductDetailSkeleton } from "./components/Skeleton";

type Props = {
  slug: string;
};

function resolvePrice(product: Product, variant?: ProductVariant) {
  const activePrice =
    product.prices?.find((p) => p.isActive) ?? product.prices?.[0];

  if (variant?.price && variant.price > 0) {
    return {
      currentPrice: variant.price,
      originalPrice: activePrice?.originalPrice ?? variant.price,
      discountPercent: activePrice?.discountPercent ?? 0,
    };
  }

  return {
    currentPrice: activePrice?.price ?? product.price?.price ?? 0,
    originalPrice:
      activePrice?.originalPrice ?? product.price?.originalPrice ?? 0,
    discountPercent:
      activePrice?.discountPercent ?? product.price?.discountPercent ?? 0,
  };
}

function buildDisplayImages(product: Product) {
  if (product.images?.length) return product.images;

  if (!product.thumbnail) return [];

  return [
    {
      id: "thumbnail",
      imageUrl: product.thumbnail,
      type: "THUMBNAIL" as const,
      sortOrder: 0,
      isPrimary: true,
      createdAt: "",
    },
  ];
}

export default function ProductDetailPage({ slug }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);

  const { data: response, isLoading } = useProductBySlug(slug);
  const { addToCart } = useCartContext();

  const product = getEnvelopeData<Product>(response);

  const selectableVariants = useMemo(
    () => product?.variants.filter((v) => v.isActive) ?? [],
    [product?.variants],
  );

  useEffect(() => {
    if (!selectableVariants.length) {
      setSelectedVariantId(null);
      return;
    }

    setSelectedVariantId((current) => {
      if (current && selectableVariants.some((v) => v.id === current))
        return current;
      return selectableVariants[0].id;
    });
  }, [selectableVariants]);

  const selectedVariant = selectableVariants.find(
    (v) => v.id === selectedVariantId,
  );
  const { currentPrice, originalPrice, discountPercent } = product
    ? resolvePrice(product, selectedVariant)
    : { currentPrice: 0, originalPrice: 0, discountPercent: 0 };

  const hasDiscount = discountPercent > 0 && originalPrice > currentPrice;
  const maxQuantity = Math.min(selectedVariant?.stock ?? 999, 999);
  const canAddToCart = !!selectedVariantId && maxQuantity > 0;

  const displayImages = product ? buildDisplayImages(product) : [];
  const selectedImageSrc =
    selectedVariant?.image ||
    displayImages[selectedImage]?.imageUrl ||
    product?.thumbnail ||
    "";

  useEffect(() => {
    setQuantity((value) => Math.min(Math.max(1, value), maxQuantity || 1));
  }, [maxQuantity, selectedVariantId]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="py-32 text-center text-slate-400">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error("Vui lòng chọn biến thể sản phẩm");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart({
        variantId: selectedVariantId,
        quantity,
        productName: product.name,
        variantLabel: selectedVariant?.title,
        unitPrice: currentPrice,
        thumbnail: selectedImageSrc,
      });
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border bg-slate-50">
            <ProductPhoto
              src={selectedImageSrc}
              alt={product.name}
              fill
              className="object-contain p-8"
            />
          </div>

          {displayImages.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {displayImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all",
                    selectedImage === idx
                      ? "scale-105 border-sky-600"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <ProductPhoto
                    src={img.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-7">
          <p className="text-lg font-medium text-sky-600">
            {product.category?.name || "Sản phẩm"}
          </p>

          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

          <div className="space-y-2">
            {hasDiscount && (
              <div className="flex items-center gap-3">
                <span className="text-2xl text-slate-400 line-through">
                  {formatVnd(originalPrice)}
                </span>
                <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  -{discountPercent}%
                </span>
              </div>
            )}
            <div className="text-4xl font-bold text-sky-700">
              {formatVnd(currentPrice)}
            </div>
          </div>

          {selectableVariants.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Biến thể</h3>
              <div className="flex flex-wrap gap-3">
                {selectableVariants.map((variant) => {
                  const isSelected = variant.id === selectedVariantId;
                  const outOfStock = variant.stock < 1;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "border-sky-600 bg-sky-50 text-sky-700"
                          : "border-slate-200 hover:border-sky-300",
                        outOfStock && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <div className="font-medium">{variant.title}</div>
                      {variant.sku && (
                        <div className="text-xs text-slate-500">
                          SKU: {variant.sku}
                        </div>
                      )}
                      <div className="text-xs text-slate-500">
                        {outOfStock ? "Hết hàng" : `Còn ${variant.stock}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">Số lượng:</span>
            <div className="flex items-center rounded-2xl border border-slate-300">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!canAddToCart || quantity <= 1}
                className="rounded-l-2xl px-5 py-3 text-xl hover:bg-slate-100 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-[50px] px-8 py-3 text-center text-lg font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={!canAddToCart || quantity >= maxQuantity}
                className="rounded-r-2xl px-5 py-3 text-xl hover:bg-slate-100 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAddToCart || isAdding}
            className="w-full cursor-pointer rounded-2xl bg-sky-500 py-7 text-lg hover:bg-sky-600 disabled:cursor-not-allowed"
          >
            {isAdding
              ? "Đang thêm..."
              : canAddToCart
                ? "Thêm vào giỏ hàng"
                : "Hết hàng"}
          </Button>

          {(product.description || product.shortDescription) && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Mô tả</h3>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">
                {product.description || product.shortDescription}
              </p>
            </div>
          )}

          {product.attributes?.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 gap-y-3 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
                {product.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4"
                  >
                    <span className="text-slate-500">{attr.name}</span>
                    <span className="text-right font-medium">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
