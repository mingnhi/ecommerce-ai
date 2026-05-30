import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { ProductListItem } from "../types/product.type";

type ColumnMeta = {
  onView: (slug: string) => void;
  onEdit: (product: ProductListItem) => void;
};

export function buildProductColumns(
  meta: ColumnMeta,
): ColumnDef<ProductListItem>[] {
  return [
    {
      id: "image",
      header: "Ảnh",
      cell: ({ row }) => {
        const imageUrl = row.original.thumbnail;
        return (
          <Avatar className="size-12 rounded-md border border-border">
            <AvatarImage src={imageUrl ?? undefined} className="object-cover" />
            <AvatarFallback className="text-xs">
              {row.original.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Tên sản phẩm",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Danh mục",
      cell: ({ row }) => row.original.category?.name ?? "—",
    },
    {
      id: "price",
      header: "Giá",
      cell: ({ row }) => {
        const price = row.original.price?.price;
        if (price == null) return "—";
        return (
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
            {Number(price).toLocaleString("vi-VN")} ₫
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.isActive !== false;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Đang bán" : "Ngừng bán"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row, table }) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0 hover:cursor-pointer text-sky-600 hover:text-sky-700 hover:bg-sky-500/10"
            aria-label="Xem chi tiết"
            onClick={() => meta.onView(row.original.slug)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0 hover:cursor-pointer"
            aria-label="Chỉnh sửa"
            onClick={() => meta.onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-destructive hover:text-destructive hover:cursor-pointer hover:bg-destructive/10"
            aria-label="Xóa sản phẩm"
            onClick={() => {
              const tableMeta = table.options.meta as {
                onDeleteTarget?: (row: ProductListItem) => void;
              };
              tableMeta?.onDeleteTarget?.(row.original);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
