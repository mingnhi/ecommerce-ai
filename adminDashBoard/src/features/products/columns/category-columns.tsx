import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, FolderTree, Pencil, Trash2 } from "lucide-react";
import type { CategoriesTableRow } from "@/features/products/types/category.type";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type BuilderProps = {
  onEdit: (row: CategoriesTableRow) => void;
};

export function buildCategoryColumns({
  onEdit,
}: BuilderProps): ColumnDef<CategoriesTableRow>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        if (row.original.rowType !== "parent") {
          return <span className="inline-block w-6 shrink-0" aria-hidden />;
        }
        return (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200",
                row.getIsExpanded() && "rotate-90",
              )}
            />
          </Button>
        );
      },
      size: 40,
    },
    {
      id: "info",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">
          Danh mục cha / Danh mục con
        </span>
      ),
      cell: ({ row }) => {
        const r = row.original;
        if (r.rowType === "parent") {
          return (
            <div className="flex min-w-[220px] items-start gap-3.5 py-1">
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
                <FolderTree className="size-4 text-sky-500" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium leading-snug text-foreground">
                  {r.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.childCount} danh mục con
                </p>
              </div>
            </div>
          );
        }
        return (
          <div className="flex min-w-[220px] items-center gap-2 py-1">
            <span className="select-none font-mono text-slate-300 dark:text-slate-700">
              ├─
            </span>
            <p className="text-sm font-medium leading-snug text-foreground">
              {r.name}
            </p>
          </div>
        );
      },
    },
    {
      id: "slug",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">Slug</span>
      ),
      cell: ({ row }) => {
        const r = row.original;
        if (r.rowType === "parent") {
          return (
            <span className="text-muted-foreground tabular-nums">—</span>
          );
        }
        return (
          <span className="font-mono text-xs text-muted-foreground">
            {r.slug}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <span className="block w-full pr-3 text-right text-sm font-medium text-muted-foreground">
          Thao tác
        </span>
      ),
      cell: ({ row, table }) => {
        const r = row.original;
        return (
          <div className="flex justify-end gap-0.5 pr-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
              aria-label="Chỉnh sửa"
              onClick={() => onEdit(r)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:cursor-pointer"
              aria-label="Xóa danh mục"
              onClick={() => {
                const tableMeta = table.options.meta as {
                  onDeleteTarget?: (row: CategoriesTableRow) => void;
                };
                tableMeta?.onDeleteTarget?.(r);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
