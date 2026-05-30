import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { CheckCircle2, EyeOff, Pencil } from "lucide-react";

import { ProductDetailSkeleton } from "../components/ProductDetailSkeleton";
import { useProductBySlug } from "../hooks/products";
import type { ProductImage, ProductVariant } from "../types/product.type";

const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export default function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useProductBySlug(slug);

  const product = data?.product;

  const activePrice = useMemo(() => {
    if (!product?.prices?.length) return null;
    return product.prices.find((p) => p.isActive) || product.prices[0];
  }, [product]);

  const images: ProductImage[] = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [product]);

  const primaryImage = images.find((i) => i.isPrimary) || images[0];
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const activeImageId = selectedImageId ?? primaryImage?.id ?? "";
  const selectedImage =
    images.find((i) => i.id === activeImageId) || primaryImage;

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  const displayPrice = activePrice?.price ?? activePrice?.originalPrice ?? 0;
  const hasDiscount = (activePrice?.discountPercent ?? 0) > 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-end">
        <Link
          to={`/products/${slug}/edit`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-sky-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-sky-700"
        >
          <Pencil size={16} />
          Chỉnh sửa
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={selectedImage?.imageUrl || "https://via.placeholder.com/800"}
              alt={product.name}
              className="size-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageId(img.id)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    activeImageId === img.id
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="mt-1 text-gray-500">Mã: {product.slug}</p>
          </div>

          <div>
            <div className="text-4xl font-semibold text-black">
              {formatCurrency(displayPrice)}
            </div>
            {hasDiscount && activePrice && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(activePrice.originalPrice)}
                </span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                  -{activePrice.discountPercent}%
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${
                product.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.isActive ? (
                <>
                  <CheckCircle2 size={16} />
                  Đang hiển thị
                </>
              ) : (
                <>
                  <EyeOff size={16} />
                  Đang ẩn
                </>
              )}
            </div>
          </div>

          {product.shortDescription && (
            <p className="text-lg text-gray-600">{product.shortDescription}</p>
          )}

          {product.description && (
            <div>
              <h3 className="mb-2 font-semibold">Mô tả chi tiết</h3>
              <div className="prose leading-relaxed text-gray-700">
                {product.description}
              </div>
            </div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Biến thể</h3>
              <div className="grid grid-cols-1 gap-3">
                {product.variants.map((variant: ProductVariant) => (
                  <div key={variant.id} className="rounded-xl border p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{variant.title}</div>
                        <div className="text-sm text-gray-500">
                          SKU: {variant.sku}
                        </div>
                      </div>
                      <div className="text-right text-sm text-green-800">
                        Còn {variant.stock} sp
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.attributes && product.attributes.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Thông số sản phẩm</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="rounded-lg bg-gray-50 p-3">
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
