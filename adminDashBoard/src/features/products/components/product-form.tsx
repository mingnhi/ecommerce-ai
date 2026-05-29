import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Upload, Trash2, Star, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import {
  useUploadProductImage,
  useDeleteProductImage,
  useSetProductThumbnail,
} from "../hooks/products";

import type {
  Product,
  ProductFormValues,
  ProductImage,
} from "../types/product.type";

interface Props {
  categories: { id: string; name: string }[];
  initialData?: Product;
  loading?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<any>;
  onSuccess?: (slug?: string) => void;
}

const DEFAULT_PRICE = {
  originalPrice: 0,
  discountPercent: undefined as number | undefined,
  currency: "VND",
  isActive: true,
};

const DEFAULT_VARIANT = {
  title: "",
  sku: "",
  stock: 0,
  price: undefined as number | undefined,
  image: undefined as string | undefined,
  isActive: true,
  attributes: {} as Record<string, any>,
};

const DEFAULT_ATTRIBUTE = {
  name: "",
  value: "",
};

export const ProductForm = ({
  categories = [],
  initialData,
  loading = false,
  onSubmit,
  onSuccess,
}: Props) => {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      categoryId: "",
      name: "",
      shortDescription: "",
      description: "",
      isActive: true,
      prices: [{ ...DEFAULT_PRICE }],
      variants: [{ ...DEFAULT_VARIANT }],
      attributes: [{ ...DEFAULT_ATTRIBUTE }],
      thumbnailFile: undefined,
      galleryFiles: [],
    },
  });

  const { register, handleSubmit, setValue, watch, reset, control } = form;

  // Sửa lỗi useFieldArray
  const priceArray = useFieldArray({ control, name: "prices" });
  const variantArray = useFieldArray({ control, name: "variants" });
  const attributeArray = useFieldArray({ control, name: "attributes" });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = priceArray;
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = variantArray;
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = attributeArray;

  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();
  const thumbnailMutation = useSetProductThumbnail();

  const thumbnailFile = watch("thumbnailFile");
  const galleryFiles = watch("galleryFiles") || [];
  const currentImages = initialData?.images || [];

  useEffect(() => {
    if (!initialData) return;
    reset({
      categoryId: initialData.category.id,
      name: initialData.name,
      shortDescription: initialData.shortDescription || "",
      description: initialData.description || "",
      isActive: initialData.isActive,
      prices: initialData.prices?.length
        ? initialData.prices
        : [{ ...DEFAULT_PRICE }],
      variants: initialData.variants?.length
        ? initialData.variants
        : [{ ...DEFAULT_VARIANT }],
      attributes: initialData.attributes?.length
        ? initialData.attributes
        : [{ ...DEFAULT_ATTRIBUTE }],
      thumbnailFile: undefined,
      galleryFiles: [],
    });
  }, [initialData, reset]);

  // ==================== THÊM VARIANT MỚI - GIỮ STOCK CỦA VARIANT TRƯỚC ĐÓ ====================
  const handleAddVariant = () => {
    const currentVariants = watch("variants") || [];
    const lastStock =
      currentVariants.length > 0
        ? currentVariants[currentVariants.length - 1].stock || 0
        : 0;

    appendVariant({
      ...DEFAULT_VARIANT,
      stock: lastStock,
    });
  };

  const onSubmitHandler = async (values: ProductFormValues) => {
    try {
      const result = await onSubmit(values);
      const productId = result?.data?.id || initialData?.id;
      const slug = result?.data?.slug || initialData?.slug;

      if (!productId) {
        toast.error("Không lấy được ID sản phẩm");
        return;
      }

      if (values.thumbnailFile) {
        await uploadMutation.mutateAsync({
          productId,
          files: [values.thumbnailFile],
          type: "THUMBNAIL",
          sortOrder: 0,
        });
      }

      if (values.galleryFiles?.length) {
        await uploadMutation.mutateAsync({
          productId,
          files: values.galleryFiles,
          type: "GALLERY",
          sortOrder: 10,
        });
      }

      toast.success(
        initialData ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!",
      );
      onSuccess?.(slug);
    } catch (error: unknown) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Bạn có chắc muốn xóa hình ảnh này?")) return;
    await deleteMutation.mutateAsync(imageId);
  };

  const handleSetThumbnail = async (imageId: string) => {
    await thumbnailMutation.mutateAsync(imageId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Danh mục <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("categoryId")}
                    onValueChange={(v) => setValue("categoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register("name")} placeholder="Ví dụ: Laptop" />
                </div>
              </div>

              <div>
                <Label>Mô tả ngắn</Label>
                <Textarea
                  {...register("shortDescription")}
                  rows={2}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                />
              </div>

              <div>
                <Label>Mô tả chi tiết</Label>
                <Textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Nhập chi tiết chất liệu, kích thước..."
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("isActive")}
                  onCheckedChange={(c) => setValue("isActive", !!c)}
                />
                <Label>Hiển thị sản phẩm</Label>
              </div>
            </CardContent>
          </Card>

          {/* Giá sản phẩm */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Giá sản phẩm
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPrice({ ...DEFAULT_PRICE })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm mức giá
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-5 rounded-xl relative"
                >
                  <div>
                    <Label>
                      Giá gốc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      {...register(`prices.${index}.originalPrice`, {
                        valueAsNumber: true,
                      })}
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <Label>Giảm giá (%)</Label>
                    <Input
                      type="number"
                      {...register(`prices.${index}.discountPercent`, {
                        valueAsNumber: true,
                      })}
                      placeholder="20"
                    />
                  </div>
                  {priceFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 text-red-500"
                      onClick={() => removePrice(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Biến thể */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Biến thể (Variants)
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm biến thể
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-5 rounded-xl relative"
                >
                  <div>
                    <Label>
                      Tên biến thể <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register(`variants.${index}.title`)}
                      placeholder="Đen - Size L"
                    />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input
                      {...register(`variants.${index}.sku`)}
                      placeholder="ATN-COTTON-DEN-L"
                    />
                  </div>
                  <div>
                    <Label>Tồn kho</Label>
                    <Input
                      type="number"
                      {...register(`variants.${index}.stock`, {
                        valueAsNumber: true,
                      })}
                      placeholder="150"
                    />
                  </div>

                  {variantFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 text-red-500"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Thuộc tính */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Thuộc tính
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAttribute({ ...DEFAULT_ATTRIBUTE })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm thuộc tính
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attributeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 border p-4 rounded-lg relative"
                >
                  <Input
                    {...register(`attributes.${index}.name`)}
                    placeholder="Màu sắc"
                  />
                  <Input
                    {...register(`attributes.${index}.value`)}
                    placeholder="Đen, Trắng, Xanh"
                  />

                  {attributeFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE - HÌNH ẢNH */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="border-2 border-dashed h-52 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:border-gray-400">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Chọn ảnh đại diện</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setValue("thumbnailFile", e.target.files?.[0] || undefined)
                  }
                />
              </label>

              {thumbnailFile && (
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  className="mt-4 w-full h-40 object-cover rounded-lg"
                  alt="thumbnail preview"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="border border-dashed p-6 flex flex-col items-center justify-center cursor-pointer rounded-xl hover:border-gray-400">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm">Chọn nhiều ảnh gallery</span>
                <input
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setValue("galleryFiles", Array.from(e.target.files || []))
                  }
                />
              </label>

              {galleryFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {galleryFiles.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      className="h-24 object-cover rounded-lg"
                      alt={`preview ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {currentImages.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Hình ảnh hiện tại</p>
                  <div className="grid grid-cols-3 gap-3">
                    {currentImages.map((image: ProductImage) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.imageUrl}
                          className="h-24 w-full object-cover rounded-lg"
                          alt=""
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => handleSetThumbnail(image.id)}
                            className="bg-white p-1 rounded shadow"
                            title="Đặt làm thumbnail"
                          >
                            <Star
                              size={16}
                              fill={image.isPrimary ? "gold" : "none"}
                              stroke={image.isPrimary ? "gold" : "currentColor"}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="bg-white p-1 rounded shadow text-red-500"
                            title="Xóa ảnh"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" size="lg" disabled={loading}>
          {loading
            ? "Đang xử lý..."
            : initialData
              ? "Cập nhật sản phẩm"
              : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
};
