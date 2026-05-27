import { useState } from "react";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import { DataTableBase } from "@/shared/components/common/DataTableBase";

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/categories";

import type { ProductCategory } from "../types";

import { CategoryForm } from "../components/category-form";

import { CategoryTree } from "../components/category-tree";

const CategoriesPage = () => {
  /**
   * modal state
   */
  const [open, setOpen] = useState(false);

  /**
   * selected category
   */
  const [selected, setSelected] = useState<ProductCategory | undefined>();

  /**
   * flat categories
   */
  const {
    data: categoriesData,
    isLoading,
  } = useCategories("flat");

  /**
   * tree categories
   */
  const {
    data: treeData,
  } = useCategories("tree");

  /**
   * mutations
   */
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  /**
   * IMPORTANT
   *
   * service category.ts
   * đã return:
   *
   * {
   *   categories: [...]
   * }
   */
  const categories = categoriesData?.categories || [];
  const treeCategories = treeData?.categories || [];

  /**
   * submit
   */
  const handleSubmit = async (values: { name: string; parentId?: string }) => {
    try {
      /**
       * update
       */
      if (selected) {
        await updateMutation.mutateAsync({
          id: selected.id,
          payload: values,
        });

        toast.success("Cập nhật danh mục thành công");
      }
      /**
       * create
       */
      else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo danh mục thành công");
      }

      /**
       * reset
       */
      setOpen(false);
      setSelected(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra");
    }
  };

  /**
   * delete
   */
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa danh mục?");

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa danh mục thành công");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa danh mục");
    }
  };

  // ==================== COLUMNS ====================
  const columns = [
    {
      accessorKey: "name",
      header: "Tên danh mục",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      id: "parent",
      header: "Danh mục cha",
      cell: ({ row }: any) => {
        const parent = categories.find((c: ProductCategory) => c.id === row.original.parentId);
        return parent ? (
          <span className="text-sm text-muted-foreground">{parent.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }: any) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.slug}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelected(row.original);
              setOpen(true);
            }}
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
    title: "Danh mục sản phẩm",
    description: "Quản lý danh mục",
    onReset: () => {},
    fields: [],
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh mục sản phẩm
          </p>
        </div>

        {/* modal */}
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setSelected(undefined);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Thêm danh mục
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>
                {selected ? "Cập nhật danh mục" : "Tạo danh mục"}
              </DialogTitle>
              <DialogDescription>
                Quản lý danh mục sản phẩm
              </DialogDescription>
            </DialogHeader>

            <CategoryForm
              categories={categories}
              initialData={selected}
              loading={createMutation.isPending || updateMutation.isPending}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* tabs */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Danh sách</TabsTrigger>
          <TabsTrigger value="tree">Tree</TabsTrigger>
        </TabsList>

        {/* table */}
        <TabsContent value="table" className="mt-5">
          {isLoading ? (
            <div className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground">
              Đang tải danh mục...
            </div>
          ) : (
            <DataTableBase
              data={categories}
              columns={columns}
              filterKey="categories"
              toolbarConfig={toolbarConfig}
              emptyMessage="Không tìm thấy danh mục nào"
              pageSizeLabel="danh mục / trang"
              deleteConfig={{
                title: "Xóa danh mục?",
                getConfirmName: (row: ProductCategory) => row.name,
                onConfirm: (row) => handleDelete(row.id),
              }}
            />
          )}
        </TabsContent>

        {/* tree */}
        <TabsContent value="tree" className="mt-5">
          <CategoryTree categories={treeCategories} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoriesPage;