import { useParams, useNavigate } from "react-router-dom";
import { useProductBySlug, useUpdateProduct } from "../hooks/products";
import { ProductForm } from "../components/product-form";
import { useCategories } from "@/features/products/hooks/categories";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";
import type { ProductFormValues, Product } from "../types/product.type";

export default function EditProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProductBySlug(slug);
  const { data: categoriesData } = useCategories("flat");
  const updateMutation = useUpdateProduct();

  const categories = categoriesData?.categories ?? [];
  const product = data?.product;

  const initialData: Product | undefined = product
    ? {
        ...product,
        prices: product.prices?.length ? product.prices : [],
        variants: product.variants?.length
          ? product.variants.map((v) => ({
              ...v,
              price: v.price ?? undefined,
              stock: v.stock ?? 0,
              title: v.title || "",
              sku: v.sku || "",
            }))
          : [],
        attributes: product.attributes?.length ? product.attributes : [],
        images: product.images ?? [],
      }
    : undefined;

  const handleSubmit = async (values: ProductFormValues) => {
    if (!product?.id) throw new Error("Không tìm thấy ID sản phẩm");
    return updateMutation.mutateAsync({ id: product.id, payload: values });
  };

  if (isLoading) {
    return <PageSkeleton filterCount={0} columnCount={4} />;
  }

  if (!product || !initialData) {
    return (
      <div className="py-20 text-center text-sm text-destructive">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <ProductForm
        categories={categories}
        initialData={initialData}
        loading={updateMutation.isPending}
        onSubmit={handleSubmit}
        onSuccess={() => navigate("/products", { replace: true })}
        onCancel={() => navigate("/products")}
      />
    </div>
  );
}
