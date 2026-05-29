'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/apis/product/requests';

import type { Product } from '@/apis/product/types';

import { ProductPhoto } from '@/modules/HomePage/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { formatVnd } from '@/lib/format-currency';

import { ProductDetailSkeleton } from './components/Skeleton';

type Props = {
  slug: string;
};

export default function ProductDetailPage({
  slug,
}: Props) {
  const [selectedImage, setSelectedImage] =
    useState(0);

  const [quantity, setQuantity] =
    useState(1);

  const { data: response, isLoading } =
    useQuery({
      queryKey: ['product', slug],
      queryFn: () =>
        ProductService.getBySlug(slug),
      enabled: !!slug,
    });


  const product =
        response?.data as Product | undefined;


  const { addLine } = useCart();

  useEffect(() => {
    if (product) {
      console.log('Product:', product);
      console.log('Variants:', product.variants);
      console.log(
        'Attributes:',
        product.attributes
      );
    }
  }, [product]);

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

  // ================= PRICE =================
const currentPrice =
  product.prices?.[0]?.price || 0;

const originalPrice =
  product.prices?.[0]?.originalPrice || 0;

const discountPercent =
  product.prices?.[0]?.discountPercent || 0;

  const hasDiscount =
    discountPercent > 0 &&
    originalPrice > currentPrice;
console.log(product.price);
  // ================= IMAGES =================
  const displayImages =
    product.images?.length
      ? product.images
      : product.thumbnail
        ? [
            {
              id: '1',
              imageUrl: product.thumbnail,
              type: 'THUMBNAIL' as const,
              sortOrder: 0,
              isPrimary: true,
              createdAt: '',
            },
          ]
        : [];

  const selectedImageSrc =
    displayImages[selectedImage]
      ?.imageUrl ||
    product.thumbnail ||
    '';

  // ================= ADD TO CART =================
  const handleAddToCart = () => {
    addLine({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity,
      image: selectedImageSrc,
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ================= IMAGES ================= */}
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
                  onClick={() =>
                    setSelectedImage(idx)
                  }
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedImage === idx
                      ? 'scale-105 border-sky-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
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

        {/* ================= INFO ================= */}
        <div className="space-y-7">
          {/* Category */}
          <p className="text-lg font-medium text-sky-600">
            {product.category?.name ||
              'Sản phẩm'}
          </p>

          {/* Name */}
          <h1 className="text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          {/* ================= PRICE ================= */}
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

          {/* ================= VARIANTS ================= */}
          {product.variants &&
            product.variants.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold">
                  Biến thể
                </h3>

                <div className="flex flex-wrap gap-3">
                  {product.variants.map(
                    (variant) => (
                      <div
                        key={variant.id}
                        className="rounded-xl border px-4 py-2 text-sm"
                      >
                        <div className="font-medium">
                          {variant.title}
                        </div>

                        {variant.sku && (
                          <div className="text-xs text-slate-500">
                            SKU: {variant.sku}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* ================= QUANTITY ================= */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">
              Số lượng:
            </span>

            <div className="flex items-center rounded-2xl border border-slate-300">
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.max(1, q - 1)
                  )
                }
                className="rounded-l-2xl px-5 py-3 text-xl hover:bg-slate-100"
              >
                −
              </button>

              <span className="min-w-[50px] px-8 py-3 text-center text-lg font-semibold">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity((q) => q + 1)
                }
                className="rounded-r-2xl px-5 py-3 text-xl hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          {/* ================= BUTTON ================= */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            className="w-full rounded-2xl bg-sky-600 py-7 text-lg hover:bg-sky-700"
          >
            Thêm vào giỏ hàng
          </Button>

          {/* ================= DESCRIPTION ================= */}
          {(product.description ||
            product.shortDescription) && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Mô tả
              </h3>

              <p className="whitespace-pre-line leading-relaxed text-slate-600">
                {product.description ||
                  product.shortDescription}
              </p>
            </div>
          )}

          {/* ================= ATTRIBUTES ================= */}
          {product.attributes &&
            product.attributes.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Thông số kỹ thuật
                </h3>

                <div className="grid grid-cols-1 gap-y-3 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2">
                  {product.attributes.map(
                    (attr, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-4"
                      >
                        <span className="text-slate-500">
                          {attr.name}
                        </span>

                        <span className="text-right font-medium">
                          {attr.value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

