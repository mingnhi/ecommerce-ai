import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";

import { useProductBySlug } from "../hooks/products";
import type { ProductImage, ProductPrice, ProductVariant } from "../types/product.type";

const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useProductBySlug(slug);

  const product = data?.product;

  // Giá đang active
  const activePrice = useMemo(() => {
    if (!product?.prices?.length) return null;
    return product.prices.find((p) => p.isActive) || product.prices[0];
  }, [product]);

  // Danh sách ảnh đã sắp xếp
  const images: ProductImage[] = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [product]);

  const primaryImage = images.find((i) => i.isPrimary) || images[0];

  const [selectedImageId, setSelectedImageId] = useState<string>("");

  useEffect(() => {
    if (primaryImage?.id) {
      setSelectedImageId(primaryImage.id);
    }
  }, [primaryImage]);

  const selectedImage = images.find((i) => i.id === selectedImageId) || primaryImage;

  if (isLoading) return <div className="p-10 text-center">Đang tải thông tin sản phẩm...</div>;
  if (isError || !product) return <div className="p-10 text-center text-red-500">Không tìm thấy sản phẩm</div>;

  const displayPrice = activePrice?.price ?? activePrice?.originalPrice ?? 0;
  const hasDiscount = (activePrice?.discountPercent ?? 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8">
        <ArrowLeft size={18} />
        Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ==================== PHẦN HÌNH ẢNH ==================== */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
            <img
              src={selectedImage?.imageUrl || "https://via.placeholder.com/800"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageId === img.id ? "border-black" : "border-transparent"
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ==================== PHẦN THÔNG TIN ==================== */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-gray-500 mt-1">Mã: {product.slug}</p>
          </div>

          {/* Giá */}
          <div>
            <div className="text-4xl font-semibold text-black">
              {formatCurrency(displayPrice)}
            </div>
            {hasDiscount && activePrice && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-gray-400 line-through text-xl">
                  {formatCurrency(activePrice.originalPrice)}
                </span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  -{activePrice.discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {product.isActive ? "✅ Đang hiển thị" : "⛔ Đang ẩn"}
            </div>
          </div>

          {/* Mô tả ngắn */}
          {product.shortDescription && (
            <p className="text-lg text-gray-600">{product.shortDescription}</p>
          )}

          {/* Mô tả chi tiết */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Mô tả chi tiết</h3>
              <div className="prose text-gray-700 leading-relaxed">
                {product.description}
              </div>
            </div>
          )}

          {/* Biến thể */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Biến thể</h3>
              <div className="grid grid-cols-1 gap-3">
                {product.variants.map((variant: ProductVariant) => (
                  <div key={variant.id} className="border rounded-xl p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{variant.title}</div>
                        <div className="text-sm text-gray-500">SKU: {variant.sku}</div>
                      </div>
                      <div className="text-right">

                        <div className="text-sm text-green-800">  Còn {variant.stock} sp</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thuộc tính */}
          {product.attributes && product.attributes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Thông số sản phẩm</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">{attr.name}</div>
                    <div className="font-medium">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}