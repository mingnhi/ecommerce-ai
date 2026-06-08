import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { buildCategoryColumns } from "@/features/products/columns/category-columns";
import { CategoryForm } from "@/features/products/components/category-form";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/products/hooks/categories";
import {
  buildCategoryTableRows,
  filterCategoryTree,
  flattenCategories,
  getCategoryFromRow,
  type CategoryListFilters,
} from "@/features/products/lib/category";
import type { CategoriesTableRow, Category } from "@/features/products/types/category.type";
import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

const defaultFilters: CategoryListFilters = { search: "" };

export default function CategoriesPage() {
  const [filters, setFilters] = React.useState(defaultFilters);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Category | undefined>();

  const { data, isLoading } = useCategories("tree");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const treeCategories = React.useMemo(
    () => data?.categories ?? [],
    [data?.categories],
  );
  const flatCategories = React.useMemo(
    () => flattenCategories(treeCategories),
    [treeCategories],
  );

  const filtered = React.useMemo(
    () => filterCategoryTree(treeCategories, filters),
    [treeCategories, filters],
  );

  const tableData = React.useMemo(
    () => buildCategoryTableRows(filtered),
    [filtered],
  );

  const filterKey = React.useMemo(
    () => [filters.search, flatCategories.length, filtered.length].join("|"),
    [filters.search, flatCategories.length, filtered.length],
  );

  const handleSubmit = async (values: { name: string; parentId?: string }) => {
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, payload: values });
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo danh mục thành công");
      }
      setOpen(false);
      setSelected(undefined);
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const onDelete = React.useCallback(
    async (category: Category) => {
      try {
        await deleteMutation.mutateAsync(category.id);
        toast.success("Xóa danh mục thành công");
      } catch {
        toast.error("Không thể xóa danh mục");
      }
    },
    [deleteMutation],
  );

  const deleteConfig = React.useMemo(
    () => ({
      title: "Xóa danh mục",
      getConfirmName: (row: CategoriesTableRow) => getCategoryFromRow(row).name,
      onConfirm: (row: CategoriesTableRow) => {
        void onDelete(getCategoryFromRow(row));
      },
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa khỏi hệ thống. Thao tác không hoàn tác.",
    }),
    [onDelete],
  );

  const columns = React.useMemo(
    () =>
      buildCategoryColumns({
        onEdit: (row) => {
          setSelected(getCategoryFromRow(row));
          setOpen(true);
        },
      }),
    [],
  );

  const getSubRows = (row: CategoriesTableRow) =>
    row.rowType === "parent" ? row.subRows : undefined;

  const rowClassName = (row: Row<CategoriesTableRow>) => {
    const isParent = row.original.rowType === "parent";
    return cn(
      "border-sky-500/10 transition-colors dark:border-border/80",
      isParent &&
        "bg-sky-500/6 hover:bg-sky-500/9 dark:bg-sky-500/10 dark:hover:bg-sky-500/[0.14]",
      !isParent &&
        "bg-card hover:bg-sky-500/4 dark:bg-card dark:hover:bg-sky-500/5",
    );
  };

  const toolbarConfig = React.useMemo(
    () => ({
      title: "Bộ lọc danh mục",
      description: "Tìm theo tên hoặc slug danh mục cha / con",
      onReset: () => setFilters(defaultFilters),
      fields: [
        {
          type: "search" as const,
          placeholder: "Tên danh mục hoặc slug...",
          value: filters.search,
          onChange: (v: string) => setFilters({ search: v }),
        },
      ],
    }),
    [filters.search],
  );

  if (isLoading) {
    return <PageSkeleton filterCount={2} columnCount={4} />;
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          className="gap-2 rounded-sm bg-sky-600 hover:bg-sky-700 hover:cursor-pointer"
          onClick={() => {
            setSelected(undefined);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Thêm danh mục
        </Button>
      </div>

      <DataTableBase
        data={tableData}
        columns={columns}
        filterKey={filterKey}
        getSubRows={getSubRows}
        mainColumnId="info"
        rowClassName={rowClassName}
        emptyMessage="Không có danh mục phù hợp bộ lọc."
        pageSizeLabel="nhóm danh mục / trang"
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
        defaultExpandedAll
      />

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setSelected(undefined);
        }}
      >
        <DialogContent className="overflow-hidden rounded-xl border border-slate-100 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-md dark:border-slate-800 dark:bg-slate-950/95">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {selected ? "Cập nhật danh mục" : "Tạo danh mục"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {selected
                ? "Chỉnh sửa thông tin danh mục sản phẩm"
                : "Thêm danh mục mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            categories={flatCategories}
            initialData={selected}
            loading={createMutation.isPending || updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpen(false);
              setSelected(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
