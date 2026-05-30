import { useNavigate } from "react-router-dom";
import { ProductForm } from "../components/product-form";
import { useCreateProduct } from "../hooks/products";
import { useCategories } from "@/features/products/hooks/categories";
import type { ProductFormValues } from "../types/product.type";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const { data: categoriesData } = useCategories("flat");
  const categories = categoriesData?.categories ?? [];

  const handleSubmit = async (values: ProductFormValues) => {
    return createMutation.mutateAsync(values);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <ProductForm
        categories={categories}
        loading={createMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={() => navigate("/products", { replace: true })}
        onCancel={() => navigate("/products")}
      />
    </div>
  );
}
