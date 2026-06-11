import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { useDebounce } from "use-debounce";

import { buildReviewColumns } from "../columns/review-columns";
import { useReviews, useDeleteReview } from "@/features/reviews/hooks/use-reviews";
import { useProducts } from "@/features/products/hooks/products";

import type { ReviewListItem } from "../types/review.type";
import type { ProductListItem } from "@/features/products/types/product.type";

import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";

export default function ReviewsPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  // Debounce search value
  const [debouncedSearch] = useDebounce(search, 400); // tăng lên 400ms cho mượt hơn

  // Fetch data
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({
    search: debouncedSearch || undefined,
    productId: selectedProductId === "all" ? undefined : selectedProductId,
  });

  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 100,
  });

  const deleteMutation = useDeleteReview();

  const allReviews = reviewsData?.reviews ?? [];

  // Client-side filter cho rating
  const filteredReviews = useMemo(() => {
    let result = [...allReviews];

    if (selectedRating !== "all") {
      const ratingNum = Number(selectedRating);
      result = result.filter((review) => review.rating === ratingNum);
    }

    return result;
  }, [allReviews, selectedRating]);

  const isLoading = productsLoading || reviewsLoading;

  const onDelete = useCallback(
    async (review: ReviewListItem) => {
      if (!review.productId) return;
      try {
        await deleteMutation.mutateAsync({
          productId: review.productId,
          reviewId: review.id,
        });
        toast.success("Xóa đánh giá thành công");
      } catch {
        toast.error("Không thể xóa đánh giá");
      }
    },
    [deleteMutation],
  );

  const columns = useMemo(
    () => buildReviewColumns({ onEdit: () => toast.info("Chức năng chỉnh sửa đang phát triển"), onDelete }),
    [onDelete],
  );

  const toolbarConfig = useMemo(
    () => ({
      title: "Quản lý Đánh giá Sản phẩm",
      description: "Xem, lọc và quản lý tất cả đánh giá",
      onReset: () => {
        setSearch("");
        setSelectedProductId("all");
        setSelectedRating("all");
      },
      fields: [
        {
          type: "select" as const,
          placeholder: "Tất cả sản phẩm",
          value: selectedProductId,
          onChange: (value: string) => setSelectedProductId(value),
          options: [
            { value: "all", label: "Tất cả sản phẩm" },
            ...productsData?.products?.map((p: ProductListItem) => ({
              value: p.id,
              label: p.name,
            })) || [],
          ],
        },
        {
          type: "search" as const,
          placeholder: "Tìm theo nội dung đánh giá, tên người dùng...",
          value: search,
          onChange: (value: string) => setSearch(value),
        },
        {
          type: "select" as const,
          placeholder: "Mức đánh giá",
          value: selectedRating,
          onChange: (value: string) => setSelectedRating(value),
          options: [
            { value: "all", label: "Tất cả đánh giá" },
            { value: "5", label: "5 sao" },
            { value: "4", label: "4 sao" },
            { value: "3", label: "3 sao" },
            { value: "2", label: "2 sao" },
            { value: "1", label: "1 sao" },
          ],
        },
      ],
    }),
    [search, selectedProductId, selectedRating, productsData],
  );

  const deleteConfig = useMemo(
    () => ({
      title: "Xóa đánh giá",
      getConfirmName: (row: ReviewListItem) => `đánh giá ${row.rating} sao của ${row.userName || "khách hàng"}`,
      onConfirm: onDelete,
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa vĩnh viễn.",
    }),
    [onDelete],
  );

  if (isLoading) {
    return <PageSkeleton filterCount={3} columnCount={6} />;
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý Đánh giá</h1>
          <p className="text-muted-foreground">
            Tổng số đánh giá: <span className="font-medium">{filteredReviews.length}</span>
          </p>
        </div>
      </div>

      <DataTableBase
        data={filteredReviews}
        columns={columns}
        filterKey={`${selectedProductId}|${debouncedSearch}|${selectedRating}`}
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
        emptyMessage="Không tìm thấy đánh giá nào phù hợp với bộ lọc"
        pageSizeLabel="đánh giá / trang"
      />
    </div>
  );
}