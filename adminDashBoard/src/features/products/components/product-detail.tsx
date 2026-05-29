import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";

import { useProductBySlug } from "../hooks/products";
import type { ProductImage, ProductPrice } from "../types/product.type";

const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const fallbackPrice: ProductPrice = {
  originalPrice: 0,
  price: 0,
  discountPercent: 0,
  isActive: true,
};

const fallbackImage: ProductImage = {
  id: "fallback",
  imageUrl: "",
  type: "GALLERY",
  sortOrder: 0,
  isPrimary: false,
};

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useProductBySlug(slug);

  const product = data?.product;

  const activePrice: ProductPrice = useMemo(() => {
    if (!product?.prices?.length) return fallbackPrice;

    return (
      product.prices.find((p) => p.isActive) ||
      product.prices[0] ||
      fallbackPrice
    );
  }, [product]);

  const images: ProductImage[] = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [product]);

  const primaryImage: ProductImage = useMemo(() => {
    return images.find((i) => i.isPrimary) || images[0] || fallbackImage;
  }, [images]);

  const [selectedImageId, setSelectedImageId] = useState("");

  useEffect(() => {
    if (primaryImage?.id && primaryImage.id !== "fallback") {
      setSelectedImageId(primaryImage.id);
    }
  }, [primaryImage.id]);

  const selectedImage =
    images.find((i) => i.id === selectedImageId) || primaryImage;

  const displayPrice =
    activePrice.price ?? activePrice.originalPrice;

  const hasDiscount = (activePrice.discountPercent ?? 0) > 0;

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (isError || !product)
    return <div className="p-6 text-red-500">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link to="/products" className="flex items-center gap-2 mb-6">
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="grid grid-cols-2 gap-10">
        {/* IMAGE */}
        <div>
          <img
            src={
              selectedImage?.imageUrl ||
              "https://via.placeholder.com/500"
            }
            className="w-full h-[500px] object-cover rounded"
          />

          <div className="grid grid-cols-5 gap-2 mt-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageId(img.id)}
              >
                <img
                  src={img.imageUrl}
                  className={`h-20 w-full object-cover rounded ${
                    selectedImage.id === img.id
                      ? "ring-2 ring-black"
                      : ""
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="text-2xl mt-4 font-bold">
            {formatCurrency(displayPrice)}
          </div>

          {hasDiscount && (
            <div className="text-red-500">
              -{activePrice.discountPercent}%
            </div>
          )}

          <p className="mt-4 text-gray-600">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}