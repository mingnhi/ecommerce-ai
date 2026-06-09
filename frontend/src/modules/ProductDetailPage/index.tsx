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

  // Dùng product.id
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

  // Handle Add to Cart (giữ nguyên code cũ của bạn)
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

          // FORCE REFRESH MẠNH NHẤT
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
      {/* ==================== PRODUCT DETAIL (giữ nguyên phần cũ) ==================== */}
      {/* Bạn copy phần này từ file cũ của bạn vào đây */}

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

        {/* Form Review */}
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

        {/* Danh sách review */}
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