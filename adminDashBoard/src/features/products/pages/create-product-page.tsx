import { useNavigate } from "react-router-dom";

import { ProductForm } from "../components/product-form";
import { useCreateProduct } from "../hooks/products";
import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues } from "../types/product.type";

const CreateProductPage = () => {
  const navigate = useNavigate();

  const createMutation = useCreateProduct();
  const { data: categoriesData } = useCategories("flat");

  const categories = categoriesData?.categories || [];

  const handleSubmit = async (values: ProductFormValues) => {
    const response = await createMutation.mutateAsync(values); // Truyền trực tiếp values
    return response;
  };

  // Sau khi tạo thành công → Quay về trang danh sách
  const handleSuccess = () => {
    navigate("/products", { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
        <p className="text-muted-foreground mt-1">Nhập thông tin sản phẩm</p>
      </div>

      <ProductForm
        categories={categories}
        loading={createMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CreateProductPage;