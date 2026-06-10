"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, User } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';

import { 
  useProductBySlug, 
  useProductReviews, 
  useCreateReview 
} from "@/apis/product/queries";
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

// ==================== HELPERS ====================
function resolvePrice(product: Product, variant?: ProductVariant) {
  const activePrice = product.prices?.find((p) => p.isActive) ?? product.prices?.[0];

  if (variant?.price && variant.price > 0) {
    return {
      currentPrice: variant.price,
      originalPrice: activePrice?.originalPrice ?? variant.price,
      discountPercent: activePrice?.discountPercent ?? 0,
    };
  }

  return {
    currentPrice: activePrice?.price ?? product.price?.price ?? 0,
    originalPrice: activePrice?.originalPrice ?? product.price?.originalPrice ?? 0,
    discountPercent: activePrice?.discountPercent ?? product.price?.discountPercent ?? 0,
  };
}

function buildDisplayImages(product: Product) {
  if (product.images?.length) return product.images;
  if (!product.thumbnail) return [];

  return [{
    id: "thumbnail",
    imageUrl: product.thumbnail,
    type: "THUMBNAIL" as const,
    sortOrder: 0,
    isPrimary: true,
    createdAt: "",
  }];
}

function calculateAverageRating(reviews: any[]) {
  if (!reviews?.length) return "0";
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

export default function ProductDetailPage({ slug }: Props) {
  const queryClient = useQueryClient();

  // States
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // API
  const { data: response, isLoading } = useProductBySlug(slug);
  const product = getEnvelopeData<Product>(response);

  const { data: reviewsResponse, refetch: refetchReviews } = useProductReviews(product?.id || "");
  const { mutate: createReviewMutate } = useCreateReview();
  const { addToCart } = useCartContext();

  const reviews = getEnvelopeData<any[]>(reviewsResponse) || [];

  const averageRating = calculateAverageRating(reviews);
  const totalReviews = reviews.length;

  const selectableVariants = useMemo(
    () => product?.variants.filter((v) => v.isActive) ?? [],
    [product?.variants]
  );

  useEffect(() => {
    if (!selectableVariants.length) {
      setSelectedVariantId(null);
      return;
    }
    setSelectedVariantId((current) => {
      if (current && selectableVariants.some((v) => v.id === current)) return current;
      return selectableVariants[0].id;
    });
  }, [selectableVariants]);

  const selectedVariant = selectableVariants.find((v) => v.id === selectedVariantId);

  const { currentPrice, originalPrice, discountPercent } = product
    ? resolvePrice(product, selectedVariant)
    : { currentPrice: 0, originalPrice: 0, discountPercent: 0 };

  const hasDiscount = discountPercent > 0 && originalPrice > currentPrice;
  const maxQuantity = Math.min(selectedVariant?.stock ?? 999, 999);
  const canAddToCart = !!selectedVariantId && maxQuantity > 0;

  const displayImages = product ? buildDisplayImages(product) : [];
  const selectedImageSrc = selectedVariant?.image ||
    displayImages[selectedImage]?.imageUrl ||
    product?.thumbnail || "";

  useEffect(() => {
    setQuantity((value) => Math.min(Math.max(1, value), maxQuantity || 1));
  }, [maxQuantity, selectedVariantId]);

  // Handle Add to Cart
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
        productName: product!.name,
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

  const handleSubmitReview = async () => {
    if (!product) return;
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1-5");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmittingReview(true);

    createReviewMutate(
      { productId: product.id, data: { rating, comment: comment.trim() } },
      {
        onSuccess: async () => {
          toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
          setComment("");
          setRating(5);

          await refetchReviews();
          await queryClient.invalidateQueries({ 
            queryKey: ['product-reviews', product.id],
            exact: true 
          });
          await queryClient.refetchQueries({ 
            queryKey: ['product-reviews', product.id] 
          });
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Không thể gửi đánh giá");
        },
        onSettled: () => {
          setIsSubmittingReview(false);
        },
      }
    );
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return <div className="py-32 text-center text-slate-400">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: Images */}
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

        {/* Right: Product Info */}
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

          {/* Variants */}
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

          {/* Quantity */}
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

          {/* Add to Cart Button */}
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

          {/* Description */}
          {(product.description || product.shortDescription) && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Mô tả</h3>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">
                {product.description || product.shortDescription}
              </p>
            </div>
          )}

          {/* Attributes */}
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

      {/* ==================== REVIEWS SECTION ==================== */}
      <div className="mt-20 border-t pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Đánh giá từ khách hàng</h2>
            <p className="text-slate-500 mt-1">
              {totalReviews} đánh giá • {averageRating} sao trung bình
            </p>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-slate-50 rounded-3xl p-8 mb-12">
          <h3 className="font-semibold text-xl mb-5">Viết đánh giá của bạn</h3>
          
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star className={cn("w-9 h-9", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
            rows={5}
            className="w-full rounded-2xl border border-slate-200 p-5 focus:outline-none focus:border-sky-500 resize-y min-h-[140px]"
          />

          <Button
            onClick={handleSubmitReview}
            disabled={isSubmittingReview || !comment.trim()}
            className="mt-6 px-10 py-6 text-base"
          >
            {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-10">
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <div key={review.id} className="border-b pb-10 last:border-b-0">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{review.user?.fullName || "Khách hàng"}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={cn("w-5 h-5", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-line">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-3xl">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}