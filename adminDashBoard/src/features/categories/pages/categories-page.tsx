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

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/categories";

import type { Category } from "../types";

import { CategoryForm } from "../components/category-form";

import { CategoryTable } from "../components/category-table";

import { CategoryTree } from "../components/category-tree";

const CategoriesPage = () => {
  /**
   * modal state
   */
  const [open, setOpen] =
    useState(false);

  /**
   * selected category
   */
  const [selected,
    setSelected] =
    useState<
      Category | undefined
    >();

  /**
   * flat categories
   */
  const {
    data:
      categoriesData,

    isLoading,
  } = useCategories(
    "flat"
  );

  /**
   * tree categories
   */
  const {
    data: treeData,
  } = useCategories(
    "tree"
  );

  /**
   * mutations
   */
  const createMutation =
    useCreateCategory();

  const updateMutation =
    useUpdateCategory();

  const deleteMutation =
    useDeleteCategory();

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
  const categories =
    categoriesData
      ?.categories || [];

  const treeCategories =
    treeData?.categories ||
    [];

  /**
   * submit
   */
  const handleSubmit =
    async (
      values: {
        name: string;

        parentId?: string;
      }
    ) => {
      try {
        /**
         * update
         */
        if (selected) {
          await updateMutation.mutateAsync(
            {
              id:
                selected.id,

              payload:
                values,
            }
          );

          toast.success(
            "Cập nhật danh mục thành công"
          );
        }

        /**
         * create
         */
        else {
          await createMutation.mutateAsync(
            values
          );

          toast.success(
            "Tạo danh mục thành công"
          );
        }

        /**
         * reset
         */
        setOpen(false);

        setSelected(
          undefined
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        toast.error(
          "Có lỗi xảy ra"
        );
      }
    };

  /**
   * delete
   */
  const handleDelete =
    async (
      id: string
    ) => {
      const confirmed =
        window.confirm(
          "Bạn có chắc muốn xóa danh mục?"
        );

      if (!confirmed)
        return;

      try {
        await deleteMutation.mutateAsync(
          id
        );

        toast.success(
          "Xóa danh mục thành công"
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        toast.error(
          "Không thể xóa danh mục"
        );
      }
    };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Categories
          </h1>

          <p className="text-sm text-muted-foreground">
            Quản lý danh mục sản phẩm
          </p>
        </div>

        {/* modal */}
        <Dialog
          open={open}
          onOpenChange={(
            value
          ) => {
            setOpen(value);

            /**
             * reset edit state
             */
            if (!value) {
              setSelected(
                undefined
              );
            }
          }}
        >
          <DialogTrigger
            asChild
          >
            <Button>
              <PlusIcon className="mr-2 size-4" />

              Thêm danh mục
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>
                {selected
                  ? "Cập nhật danh mục"
                  : "Tạo danh mục"}
              </DialogTitle>

              <DialogDescription>
                Quản lý danh mục sản phẩm
              </DialogDescription>
            </DialogHeader>

            <CategoryForm
              categories={
                categories
              }
              initialData={
                selected
              }
              loading={
                createMutation.isPending ||
                updateMutation.isPending
              }
              onSubmit={
                handleSubmit
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* tabs */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">
            Danh sách
          </TabsTrigger>

          <TabsTrigger value="tree">
            Tree
          </TabsTrigger>
        </TabsList>

        {/* table */}
        <TabsContent
          value="table"
          className="mt-5"
        >
          {isLoading ? (
            <div className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground">
              Đang tải danh mục...
            </div>
          ) : (
            <CategoryTable
              categories={
                categories
              }
              onEdit={(
                category
              ) => {
                setSelected(
                  category
                );

                setOpen(
                  true
                );
              }}
              onDelete={
                handleDelete
              }
            />
          )}
        </TabsContent>

        {/* tree */}
        <TabsContent
          value="tree"
          className="mt-5"
        >
          <CategoryTree
            categories={
              treeCategories
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoriesPage;

