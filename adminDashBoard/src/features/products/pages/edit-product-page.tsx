import { useParams, useNavigate } from "react-router-dom";

import { useProductBySlug, useUpdateProduct } from "../hooks/products";

import { ProductForm } from "../components/product-form";
import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues } from "../types/product.type";
import type { Product } from "../types/product.type";

const EditProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useProductBySlug(slug || "");
  const { data: categoriesData } = useCategories("flat");

  const updateMutation = useUpdateProduct();

  const categories = categoriesData?.categories || [];
  const product = data?.product;

  // ====================== TRANSFORM DATA CHO FORM ======================
  const initialDataForForm: Product | undefined = product
    ? {
        ...product,
        // Đảm bảo các mảng không bị undefined
        prices: product.prices?.length ? product.prices : [],
        variants: product.variants?.length
          ? product.variants.map((v: unknown) => ({
              ...v,
              price: v.price ?? undefined,
              stock: v.stock ?? 0,
              title: v.title || "",
              sku: v.sku || "",
            }))
          : [],
        attributes: product.attributes?.length ? product.attributes : [],
        // Giữ nguyên images để hiển thị phần "Hình ảnh hiện tại"
        images: product.images || [],
      }
    : undefined;

  const handleSubmit = async (values: ProductFormValues) => {
    if (!product?.id) {
      throw new Error("Không tìm thấy ID sản phẩm");
    }

    const response = await updateMutation.mutateAsync({
      id: product.id,
      payload: values,
    });

    return response;
  };

  const handleSuccess = () => {
    navigate("/products", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">Đang tải thông tin sản phẩm...</div>
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
        initialData={initialDataForForm} // ← Truyền data đã transform
        loading={updateMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default EditProductPage;
