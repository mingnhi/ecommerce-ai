import {
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

import type { ProductListItem } from "../types/product.type";

interface Props {
  products: ProductListItem[];

  onView: (slug: string) => void;

  onEdit: (product: ProductListItem) => void;

  onDelete: (id: string) => void;
}

export const ProductTable = ({
  products,
  onView,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">
              Hình ảnh
            </th>

            <th className="px-4 py-4 text-left font-semibold">
              Tên sản phẩm
            </th>

            <th className="px-4 py-4 text-left font-semibold">
              Danh mục
            </th>

            <th className="px-4 py-4 text-right font-semibold">
              Giá
            </th>

            <th className="px-4 py-4 text-center font-semibold">
              Trạng thái
            </th>

            <th className="px-4 py-4 text-right font-semibold">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            return (
              <tr
                key={product.id}
                className="border-t transition-colors hover:bg-muted/40"
              >
                {/* IMAGE */}
                <td className="px-4 py-4">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-16 w-16 rounded-xl border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-muted">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </td>

                {/* NAME */}
                <td className="px-4 py-4">
                  <div className="font-semibold">
                    {product.name}
                  </div>

                  {product.shortDescription && (
                    <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {product.shortDescription}
                    </div>
                  )}
                </td>

                {/* CATEGORY */}
                <td className="px-4 py-4 text-muted-foreground">
                  {product.category?.name}
                </td>

                {/* PRICE */}
                <td className="px-4 py-4 text-right">
                  {product.price ? (
                    <div className="font-semibold">
                      {Number(
                        product.price?.price || 0
                      ).toLocaleString("vi-VN")}
                      đ
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      —
                    </span>
                  )}
                </td>

                {/* STATUS */}
                <td className="px-4 py-4 text-center">
                  <Badge
                    variant={
                      product.isActive
                        ? "default"
                        : "secondary"
                    }
                  >
                    {product.isActive
                      ? "Hoạt động"
                      : "Ẩn"}
                  </Badge>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        onView(product.slug)
                      }
                    >
                      <EyeIcon className="size-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        onEdit(product)
                      }
                    >
                      <PencilIcon className="size-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() =>
                        onDelete(product.id)
                      }
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}

          {!products.length && (
            <tr>
              <td
                colSpan={6}
                className="py-16 text-center text-muted-foreground"
              >
                Không có sản phẩm nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};