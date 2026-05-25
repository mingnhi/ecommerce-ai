import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ProductForm } from "../components/product-form";
import { useCreateProduct } from "../hooks/products";
import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues } from "../types/product.type";
import productService from "@/services/product";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const { data: categoriesData } = useCategories("flat");

  const categories = categoriesData?.categories || [];

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      const response = await createMutation.mutateAsync(values);
      const productId = response.data?.product?.id || response.data?.data?.product?.id;

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

      toast.success("Tạo sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tạo sản phẩm");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
      </div>

      <ProductForm
        categories={categories}
        loading={createMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateProductPage;