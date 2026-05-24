import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useProductBySlug } from "../hooks/products";
import { ProductDetail } from "../components/product-detail";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useProductBySlug(slug || "");

  const product = data?.product;

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="text-lg">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <div className="text-xl text-red-500">Không tìm thấy sản phẩm</div>
        <Button onClick={() => navigate("/products")} className="mt-4">
          Quay về danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => navigate("/products")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chi tiết sản phẩm</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {/* Product Detail Component */}
      <ProductDetail product={product} />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-10">
        <Button
          variant="outline"
          onClick={() => navigate(`/products/${slug}/edit`)}
        >
          Chỉnh sửa sản phẩm
        </Button>
        <Button
          onClick={() => navigate("/products")}
        >
          Quay về danh sách
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;