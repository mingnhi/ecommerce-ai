import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import reviewService from "@/services/review";
import type { ReviewListQuery, UpdateReviewRequest } from "../types/review.type";

export const useReviews = (params?: ReviewListQuery) =>
  useQuery({
    queryKey: ["reviews", params],
    queryFn: () => reviewService.getAllReviews(params),
    enabled: true,  
  });

// Vì hiện tại chưa có API lấy tất cả reviews, ta sẽ làm theo product trước
// Sau này bạn có thể thêm useAllReviews khi BE bổ sung endpoint

export const useUpdateReview = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      reviewId,
      payload,
    }: {
      productId: string;
      reviewId: string;
      payload: UpdateReviewRequest;
    }) => reviewService.updateReview(productId, reviewId, payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewId }: { productId: string; reviewId: string }) =>
      reviewService.deleteReview(productId, reviewId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};