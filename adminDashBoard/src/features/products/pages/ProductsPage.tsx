import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { buildProductColumns } from "@/features/products/columns/product-columns";
import { useProducts, useDeleteProduct } from "@/features/products/hooks/products";
import { useCategories } from "@/features/products/hooks/categories";
import type { ProductListItem } from "@/features/products/types/product.type";
import type { Category } from "@/features/products/types/category.type";
import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";
import { Button } from "@/shared/components/ui/button";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState("newest");

  const { data: productsData, isLoading } = useProducts({
    search,
    limit: 50,
    categoryId: categoryId === "all" ? undefined : categoryId,
    sort,
  });
  const { data: categoriesData } = useCategories("flat");
  const deleteMutation = useDeleteProduct();

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];

  const onDelete = useCallback(
    async (product: ProductListItem) => {
      try {
        await deleteMutation.mutateAsync(product.id);
        toast.success("Xóa sản phẩm thành công");
      } catch {
        toast.error("Không thể xóa sản phẩm");
      }
    },
    [deleteMutation],
  );

  const columns = useMemo(
    () =>
      buildProductColumns({
        onView: (slug) => navigate(`/products/${slug}`),
        onEdit: (product) => navigate(`/products/${product.slug}/edit`),
      }),
    [navigate],
  );

  const toolbarConfig = useMemo(
    () => ({
      title: "Bộ lọc sản phẩm",
      description: "Tìm kiếm và lọc theo danh mục, sắp xếp",
      onReset: () => {
        setSearch("");
        setCategoryId("all");
        setSort("newest");
      },
      fields: [
        {
          type: "search" as const,
          placeholder: "Tìm theo tên sản phẩm, slug...",
          value: search,
          onChange: setSearch,
        },
        {
          type: "select" as const,
          placeholder: "Tất cả danh mục",
          value: categoryId,
          onChange: setCategoryId,
          options: [
            { value: "all", label: "Tất cả danh mục" },
            ...categories.map((cat: Category) => ({
              value: cat.id,
              label: cat.name,
            })),
          ],
        },
        {
          type: "select" as const,
          placeholder: "Sắp xếp",
          value: sort,
          onChange: setSort,
          options: [
            { value: "newest", label: "Mới nhất" },
            { value: "oldest", label: "Cũ nhất" },
            { value: "price_asc", label: "Giá thấp → cao" },
            { value: "price_desc", label: "Giá cao → thấp" },
          ],
        },
      ],
    }),
    [search, categoryId, sort, categories],
  );

  const deleteConfig = useMemo(
    () => ({
      title: "Xóa sản phẩm",
      getConfirmName: (row: ProductListItem) => row.name,
      onConfirm: (row: ProductListItem) => {
        void onDelete(row);
      },
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa khỏi hệ thống. Thao tác không hoàn tác.",
    }),
    [onDelete],
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
          onClick={() => navigate("/products/create")}
        >
          <Plus className="size-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <DataTableBase
        data={products}
        columns={columns}
        filterKey={`${search}|${categoryId}|${sort}`}
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
        emptyMessage="Không tìm thấy sản phẩm nào"
        pageSizeLabel="sản phẩm / trang"
      />
    </div>
  );
}
