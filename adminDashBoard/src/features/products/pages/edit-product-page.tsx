import { useParams, useNavigate } from "react-router-dom";

import {
  useProductBySlug,
  useUpdateProduct,
  useUploadProductImage,
} from "../hooks/products";

import { ProductForm } from "../components/product-form";
import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues } from "../types/product.type";

const EditProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useProductBySlug(slug || "");
  const { data: categoriesData } = useCategories("flat");

  const updateMutation = useUpdateProduct();
  const uploadMutation = useUploadProductImage();

  const categories = categoriesData?.categories || [];
  const product = data?.product;

  /**
   * Chỉ update product, trả về response.
   * ProductForm tự upload ảnh sau, rồi gọi onSuccess.
   * KHÔNG navigate ở đây.
   */
  const handleSubmit = async (values: ProductFormValues) => {
    if (!product) return;

    const response = await updateMutation.mutateAsync({
      id: product.id,
      payload: {
        categoryId: values.categoryId,
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        isActive: values.isActive,
        prices: values.prices || [],
        variants: values.variants || [],
        attributes: values.attributes || [],
      },
    });

    await refetch();
    return response;
  };

  const handleSuccess = (newSlug?: string) => {
    navigate(newSlug ? `/products/${newSlug}` : "/products");
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-red-500">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
        <p className="text-muted-foreground mt-1">{product.name}</p>
      </div>

      <ProductForm
        categories={categories}
        initialData={product}
        loading={updateMutation.isPending || uploadMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default EditProductPage;
