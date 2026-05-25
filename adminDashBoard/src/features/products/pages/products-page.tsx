import { useState } from "react";

import {
  PlusIcon,
  SearchIcon,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import { Input } from "@/shared/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { ProductDialog } from "../components/product-dialog";

import { ProductTable } from "../components/product-table";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/products";

import { useCategories } from "@/features/categories/hooks/categories";

import type { Category } from "@/features/categories/types";

import productService from "@/services/product";

import type {
  Product,
  ProductFormValues,
} from "../types/product.type";

const ProductsPage = () => {
  const [open, setOpen] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<
    Product | undefined
  >();

  /**
   * SEARCH
   */
  const [search, setSearch] =
    useState("");

  /**
   * FILTER CATEGORY
   */
  const [
    categoryId,
    setCategoryId,
  ] = useState("all");

  /**
   * SORT
   */
  const [sort, setSort] =
    useState("newest");

  /**
   * PRODUCTS QUERY
   */
  const {
    data: productsData,
    isLoading:
      isProductsLoading,
    refetch,
  } = useProducts({
    search,

    limit: 50,

    categoryId:
      categoryId === "all"
        ? undefined
        : categoryId,

    sort,
  });

  /**
   * CATEGORIES QUERY
   */
  const {
    data: categoriesData,
  } = useCategories("flat");

  /**
   * MUTATIONS
   */
  const createMutation =
    useCreateProduct();

  const updateMutation =
    useUpdateProduct();

  const deleteMutation =
    useDeleteProduct();

  /**
   * DATA
   */
  const products =
    productsData?.products ||
    [];

  const categories =
    categoriesData?.categories ||
    [];

  /**
   * SUBMIT
   */
  const handleSubmit =
    async (
      values: ProductFormValues
    ) => {
      try {
        let productId: string;

        /**
         * UPDATE
         */
        if (selectedProduct) {
          await updateMutation.mutateAsync(
            {
              id:
                selectedProduct.id,

              payload: values,
            }
          );

          productId =
            selectedProduct.id;

          toast.success(
            "Cập nhật sản phẩm thành công"
          );
        } else {
          /**
           * CREATE
           */
          const response =
            await createMutation.mutateAsync(
              values
            );

          productId =
            response.data
              ?.product?.id ||
            response.data?.data
              ?.product?.id;

          if (!productId) {
            toast.error(
              "Không lấy được ID sản phẩm từ server"
            );

            return;
          }

          toast.success(
            "Tạo sản phẩm thành công"
          );
        }

        /**
         * UPLOAD THUMBNAIL
         */
        if (
          productId &&
          values.thumbnailFile
        ) {
          await productService.uploadImage(
            productId,
            values.thumbnailFile,
            "THUMBNAIL",
            0
          );
        }

        /**
         * UPLOAD GALLERY
         */
        if (
          productId &&
          values.galleryFiles
            ?.length
        ) {
          await Promise.all(
            values.galleryFiles.map(
              (
                file,
                index
              ) =>
                productService.uploadImage(
                  productId,
                  file,
                  "GALLERY",
                  index + 1
                )
            )
          );
        }

        /**
         * CLOSE
         */
        setOpen(false);

        setSelectedProduct(
          undefined
        );

        /**
         * REFRESH
         */
        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              500
            )
        );

        await refetch();
      } catch (error: any) {
        console.error(
          "❌ Error:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Có lỗi xảy ra khi lưu sản phẩm"
        );
      }
    };

  /**
   * DELETE
   */
  const handleDelete = (
    id: string
  ) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa sản phẩm này?"
      )
    ) {
      return;
    }

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(
          "Xóa sản phẩm thành công"
        );

        refetch();
      },

      onError: () => {
        toast.error(
          "Không thể xóa sản phẩm"
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h1>

          <p className="mt-1 text-muted-foreground">
            Tổng số:
            {" "}
            {products.length}
            {" "}
            sản phẩm
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedProduct(
              undefined
            );

            setOpen(true);
          }}
          className="h-11 px-5"
        >
          <PlusIcon className="mr-2 size-4" />

          Thêm sản phẩm
        </Button>
      </div>

      {/* FILTER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* SEARCH */}
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={e =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Tìm kiếm sản phẩm..."
            className="h-11 pl-10"
          />
        </div>

        {/* CATEGORY FILTER */}
        <Select
          value={categoryId}
          onValueChange={
            setCategoryId
          }
        >
          <SelectTrigger className="h-11 w-full md:w-[220px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Tất cả danh mục
            </SelectItem>

            {categories.map(
              (
                category: Category
              ) => (
                <SelectItem
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {category.name}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {/* SORT */}
        <Select
          value={sort}
          onValueChange={setSort}
        >
          <SelectTrigger className="h-11 w-full md:w-[240px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="newest">
              Mới nhất
            </SelectItem>

            <SelectItem value="oldest">
              Cũ nhất
            </SelectItem>

            <SelectItem value="price_asc">
              Giá thấp → cao
            </SelectItem>

            <SelectItem value="price_desc">
              Giá cao → thấp
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      {isProductsLoading ? (
        <div className="rounded-2xl border bg-card py-20 text-center text-muted-foreground">
          Đang tải danh sách sản phẩm...
        </div>
      ) : (
        <ProductTable
          products={products}
          onView={slug =>
            (window.location.href = `/products/${slug}`)
          }
          onEdit={product => {
            setSelectedProduct(
              product as Product
            );

            setOpen(true);
          }}
          onDelete={
            handleDelete
          }
        />
      )}

      {/* DIALOG */}
      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        initialData={
          selectedProduct
        }
        categories={categories}
        loading={
          createMutation.isPending ||
          updateMutation.isPending
        }
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
};

export default ProductsPage;