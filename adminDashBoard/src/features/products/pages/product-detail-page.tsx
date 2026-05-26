import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

/**
 * ProductDetail component tự nhận slug qua useParams bên trong.
 * Page này chỉ cần render wrapper + header + actions.
 */
import ProductDetail from "../components/product-detail";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={() => navigate("/products")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>

        <Button
          onClick={() => navigate(`/products/${slug}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="size-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/*
        ProductDetail tự gọi useParams() và useProductBySlug() bên trong.
        Không cần truyền product prop.
      */}
      <ProductDetail />
    </div>
  );
};

export default ProductDetailPage;
