// features/reviews/components/ReviewTable.tsx
import { Star, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { ReviewListItem } from "../types/review.type";

interface Props {
  reviews: ReviewListItem[];
  onEdit: (review: ReviewListItem) => void;
  onDelete: (review: ReviewListItem) => void;
}

export const ReviewTable = ({ reviews, onEdit, onDelete }: Props) => {
  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted">
            <th className="text-left">Người dùng</th>
            <th className="text-left">Sản phẩm</th>
            <th>Đánh giá</th>
            <th className="text-left">Nội dung</th>
            <th>Ngày</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="border-t hover:bg-muted/50">
              <td className="px-4 py-3">
                <div className="font-medium">{review.userName || "Người dùng"}</div>
                <div className="text-xs text-muted-foreground">ID: {review.userId}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{review.productName}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 max-w-md">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.comment || "Không có nội dung"}
                </p>
              </td>
              <td className="px-4 py-3 text-sm">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(review)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};