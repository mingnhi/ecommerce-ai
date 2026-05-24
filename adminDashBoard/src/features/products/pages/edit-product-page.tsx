import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useProductBySlug,
  useUpdateProduct,
  useUploadProductImage,
} from "../hooks/products";

import { ProductForm } from "../components/product-form";
import { useCategories } from "@/features/categories/hooks/categories";

import type { ProductFormValues } from "../types/product.type";
import { ProductImageType } from "../types/product.type";

const EditProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useProductBySlug(slug || "");
  const { data: categoriesData } = useCategories("flat");

  const updateMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage();

  const categories = categoriesData?.categories || [];
  const product = data?.product;

  const handleSubmit = async (values: ProductFormValues) => {
    if (!product) return;

    try {
      await updateMutation.mutateAsync({
        id: product.id,
        payload: {
          categoryId: values.categoryId,
          name: values.name,
          shortDescription: values.shortDescription,
          description: values.description,
          isActive: values.isActive,
          prices: values.prices,
          variants: values.variants,
          attributes: values.attributes,
        },
      });

      if (values.thumbnailFile) {
        await uploadImageMutation.mutateAsync({
          productId: product.id,
          file: values.thumbnailFile,
          type: ProductImageType.THUMBNAIL,
          sortOrder: 0,
        });
      }

      if (values.galleryFiles?.length) {
        await Promise.all(
          values.galleryFiles.map((file, index) =>
            uploadImageMutation.mutateAsync({
              productId: product.id,
              file,
              type: ProductImageType.GALLERY,
              sortOrder: index + 1,
            })
          )
        );
      }

      await refetch();
      toast.success("Cập nhật sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi cập nhật sản phẩm");
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="py-20 text-center">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
        <p className="text-muted-foreground mt-1">{product.name}</p>
      </div>

      <ProductForm
        categories={categories}
        initialData={product}
        loading={updateMutation.isPending || uploadImageMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditProductPage;