import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";

import { DataTableBase } from "@/shared/components/common/DataTableBase";

import { useProducts, useDeleteProduct } from "../hooks/products";

import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductListItem } from "../types/product.type";

const ProductsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState("newest");

  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch,
  } = useProducts({
    search,
    limit: 50,
    categoryId: categoryId === "all" ? undefined : categoryId,
    sort,
  });

  const { data: categoriesData } = useCategories("flat");
  const deleteMutation = useDeleteProduct();

  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // ==================== HANDLERS (Giữ nguyên y hệt) ====================
  const handleCreate = () => {
    navigate("/products/create");
  };

  const handleEdit = (product: ProductListItem) => {
    navigate(`/products/${product.slug}/edit`);
  };

  const handleView = (slug: string) => {
    navigate(`/products/${slug}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Xóa sản phẩm thành công");
        refetch();
      },
      onError: () => toast.error("Không thể xóa sản phẩm"),
    });
  };

  // ==================== COLUMNS ====================
  const columns = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }: unknown) => {
        const imageUrl =
          row.original.thumbnail || row.original.images?.[0]?.imageUrl;
        return (
          <Avatar className="h-12 w-12 rounded-md border border-border">
            <AvatarImage src={imageUrl} className="object-cover" />
            <AvatarFallback className="text-xs">
              {row.original.name?.slice(0, 2).toUpperCase() || "SP"}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: unknown) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.sku && (
            <p className="text-xs text-muted-foreground">{row.original.sku}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: unknown) =>
        row.original.category?.name || "Chưa phân loại",
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }: unknown) => {
        const price = row.original.price.price;
        return (
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
            {Number(price).toLocaleString("vi-VN")} ₫
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: unknown) => {
        const isActive = row.original.isActive !== false;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: unknown) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original.slug)}
            className="h-8 w-8 p-0 hover:bg-sky-500/10 hover:text-sky-500"
          >
            👁️
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
            className="h-8 w-8 p-0 hover:bg-sky-500/10 hover:text-sky-500"
          >
            ✏️
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  // ==================== TOOLBAR ====================
  const toolbarConfig = {
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
        placeholder: "Tìm theo tên sản phẩm, SKU...",
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
          ...categories.map((cat: unknown) => ({
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
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tổng số:{" "}
            <span className="font-semibold text-foreground">
              {products.length}
            </span>{" "}
            sản phẩm
          </p>
        </div>

        <Button onClick={handleCreate} className="h-11 px-5">
          <PlusIcon className="mr-2 size-4" />
          Thêm sản phẩm mới
        </Button>
      </div>

      <DataTableBase
        data={products}
        columns={columns}
        filterKey={`${search}|${categoryId}|${sort}`}
        toolbarConfig={toolbarConfig}
        emptyMessage="Không tìm thấy sản phẩm nào"
        pageSizeLabel="sản phẩm / trang"
        deleteConfig={{
          title: "Xóa sản phẩm?",
          getConfirmName: (row: ProductListItem) => row.name,
          onConfirm: (row) => handleDelete(row.id),
        }}
      />

      {isProductsLoading && (
        <Card className="py-20 text-center border-sky-500/20">
          <CardContent>Đang tải danh sách...</CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductsPage;
