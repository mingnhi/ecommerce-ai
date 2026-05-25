import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import type { Product, ProductImage } from "../types/product.type";

interface Props {
  product: Product;
}

export const ProductDetail = ({ product }: Props) => {
  const activePrice =
    product.prices?.find((item) => item.isActive) || product.prices?.[0];

  const allImages: Array<{ id: string; imageUrl: string }> = [
    ...(product.thumbnail
      ? [{ id: "thumbnail", imageUrl: product.thumbnail }]
      : []),
    ...(product.images || []).map((img: ProductImage) => ({
      id: img.id,
      imageUrl: img.imageUrl,
    })),
  ];

  const [selectedImage, setSelectedImage] = useState(
    allImages[0]?.imageUrl || ""
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* Phần hình ảnh */}
      <div>
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={product.name}
            className="aspect-square w-full rounded-2xl border object-cover"
          />
        ) : (
          <div className="aspect-square rounded-2xl border bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Không có hình ảnh</span>
          </div>
        )}

        {!!allImages.length && (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {allImages.map((image, index) => (
              <button
                key={image.id || index}
                type="button"
                onClick={() => setSelectedImage(image.imageUrl)}
                className={`overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImage === image.imageUrl
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.category?.name}</p>
        </div>

        {activePrice && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">
                {activePrice.price.toLocaleString("vi-VN")}đ
              </span>
              {activePrice.originalPrice > activePrice.price && (
                <span className="text-xl text-muted-foreground line-through">
                  {activePrice.originalPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>
            {!!activePrice.discountPercent && (
              <Badge variant="destructive">
                -{activePrice.discountPercent}%
              </Badge>
            )}
          </div>
        )}

        {product.shortDescription && (
          <div>
            <h3 className="mb-2 font-semibold">Mô tả ngắn</h3>
            <p className="text-muted-foreground">{product.shortDescription}</p>
          </div>
        )}

        {product.description && (
          <div>
            <h3 className="mb-2 font-semibold">Mô tả chi tiết</h3>
            <div className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {!!product.attributes?.length && (
          <div>
            <h3 className="mb-3 font-semibold">Thuộc tính</h3>
            <div className="space-y-2">
              {product.attributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span>{attr.name}</span>
                  <span className="font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!product.variants?.length && (
          <div>
            <h3 className="mb-3 font-semibold">Variants</h3>
            <div className="space-y-3">
              {product.variants.map((variant, index) => (
                <div key={index} className="rounded-xl border p-4">
                  <div className="font-medium">{variant.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    SKU: {variant.sku}
                  </div>
                  {variant.stock !== undefined && (
                    <div className="mt-1 text-sm">Stock: {variant.stock}</div>
                  )}
                  {!!variant.price && (
                    <div className="mt-2 font-semibold">
                      {variant.price.toLocaleString("vi-VN")}đ
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};