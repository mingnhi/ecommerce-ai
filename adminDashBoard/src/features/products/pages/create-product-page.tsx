import { useNavigate } from "react-router-dom";

import { ProductForm } from "../components/product-form";
import { useCreateProduct, useUploadProductImage } from "../hooks/products";
import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues } from "../types/product.type";

const CreateProductPage = () => {
  const navigate = useNavigate();

  const createMutation = useCreateProduct();
  const uploadMutation = useUploadProductImage();
  const { data: categoriesData } = useCategories("flat");

  const categories = categoriesData?.categories || [];

  /**
   * Chỉ tạo product, trả về response.
   * ProductForm tự upload ảnh sau, rồi gọi onSuccess.
   * KHÔNG navigate ở đây.
   */
  const handleSubmit = async (values: ProductFormValues) => {
    const response = await createMutation.mutateAsync({
      categoryId: values.categoryId,
      name: values.name,
      shortDescription: values.shortDescription,
      description: values.description,
      isActive: values.isActive,
      prices: values.prices || [],
      variants: values.variants || [],
      attributes: values.attributes || [],
    });

    return response;
  };

  const handleSuccess = (slug?: string) => {
    navigate(slug ? `/products/${slug}` : "/products");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
        <p className="text-muted-foreground mt-1">Nhập thông tin sản phẩm</p>
      </div>

      <ProductForm
        categories={categories}
        loading={createMutation.isPending || uploadMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CreateProductPage;
