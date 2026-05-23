import {
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import {
  Badge,
} from "@/shared/components/ui/badge";

import {
  Button,
} from "@/shared/components/ui/button";

import type { Category } from "../types";

interface Props {
  categories: Category[];

  onEdit: (
    category: Category
  ) => void;

  onDelete: (
    id: string
  ) => void;
}

export const CategoryTable = ({
  categories,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Tên
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold">
              Slug
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold">
              Loại
            </th>

            <th className="px-4 py-3 text-right text-sm font-semibold">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map(
            category => (
              <tr
                key={
                  category.id
                }
                className="border-t"
              >
                <td className="px-4 py-3 font-medium">
                  {
                    category.name
                  }
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {
                    category.slug
                  }
                </td>

                <td className="px-4 py-3">
                  {category.parentId ? (
                    <Badge variant="secondary">
                      Child
                    </Badge>
                  ) : (
                    <Badge>
                      Parent
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        onEdit(
                          category
                        )
                      }
                    >
                      <PencilIcon className="size-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() =>
                        onDelete(
                          category.id
                        )
                      }
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          )}

          {!categories.length && (
            <tr>
              <td
                colSpan={4}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                Không có danh mục
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};