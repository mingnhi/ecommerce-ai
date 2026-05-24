import { useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { ProductDialog } from "../components/product-dialog";
import { ProductTable } from "../components/product-table";

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/products";

import { useCategories } from "@/features/categories/hooks/categories";
import productService from "@/services/product";

import type { Product, ProductFormValues } from "../types/product.type";

const ProductsPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const [search, setSearch] = useState("");

  // Query
  const { 
    data: productsData, 
    isLoading: isProductsLoading,
    refetch 
  } = useProducts({ 
    search, 
    limit: 50 
  });

  const { data: categoriesData } = useCategories("flat");

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      let productId: string;

      if (selectedProduct) {
        // UPDATE
        await updateMutation.mutateAsync({
          id: selectedProduct.id,
          payload: values,
        });
        productId = selectedProduct.id;
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        // CREATE
        const response = await createMutation.mutateAsync(values);
        productId = response.data?.product?.id || response.data?.data?.product?.id;

        if (!productId) {
          toast.error("Không lấy được ID sản phẩm từ server");
          return;
        }

        toast.success("Tạo sản phẩm thành công");
      }

      // Upload images
      if (productId) {
        if (values.thumbnailFile) {
          await productService.uploadImage(productId, values.thumbnailFile, "THUMBNAIL", 0);
        }

        if (values.galleryFiles?.length) {
          await Promise.all(
            values.galleryFiles.map((file, index) =>
              productService.uploadImage(productId, file, "GALLERY", index + 1)
            )
          );
        }
      }

      // Close dialog & refresh list
      setOpen(false);
      setSelectedProduct(undefined);
      
      // Force refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      await refetch();

    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm");
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground mt-1">
            Tổng số: {products.length} sản phẩm
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedProduct(undefined);
            setOpen(true);
          }}
          className="h-11 px-5"
        >
          <PlusIcon className="mr-2 size-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="pl-10 h-11"
        />
      </div>

      {isProductsLoading ? (
        <div className="border rounded-2xl py-20 text-center text-muted-foreground bg-card">
          Đang tải danh sách sản phẩm...
        </div>
      ) : (
        <ProductTable
          products={products}
          onView={(slug) => (window.location.href = `/products/${slug}`)}
          onEdit={(product) => {
            setSelectedProduct(product);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        initialData={selectedProduct}
        categories={categories}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ProductsPage;