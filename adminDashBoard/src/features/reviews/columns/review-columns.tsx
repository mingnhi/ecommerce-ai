import type { ColumnDef } from "@tanstack/react-table";
import { Star, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { ReviewListItem } from "../types/review.type";

type ColumnMeta = {
  onEdit: (review: ReviewListItem) => void;
  onDelete: (review: ReviewListItem) => void;
};

export function buildReviewColumns(meta: ColumnMeta): ColumnDef<ReviewListItem>[] {
  return [
    {
      id: "user",
      header: "Người dùng",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.userName || "Người dùng"}</p>
          <p className="text-xs text-muted-foreground">ID: {row.original.userId}</p>
        </div>
      ),
    },
    {
      id: "product",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="font-medium line-clamp-1">{row.original.productName}</p>
        </div>
      ),
    },
    {
      id: "rating",
      header: "Đánh giá",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${
                i < row.original.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium">({row.original.rating})</span>
        </div>
      ),
    },
    {
      accessorKey: "comment",
      header: "Nội dung",
      cell: ({ row }) => (
        <div className="max-w-md text-sm text-muted-foreground line-clamp-2">
          {row.original.comment || "Không có nội dung"}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Ngày đánh giá",
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0 hover:cursor-pointer"
            onClick={() => meta.onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => meta.onDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}