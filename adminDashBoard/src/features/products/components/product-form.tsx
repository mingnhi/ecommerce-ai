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
  onCancel?: () => void;
}

const cardClass =
  "overflow-hidden rounded-md border border-sky-500/15 bg-card shadow-sm ring-0";
const fieldClass =
  "h-10 w-full rounded-md border border-slate-200 bg-background/50 text-sm transition-all placeholder:text-muted-foreground/60 focus-visible:border-sky-500 focus-visible:ring-3 focus-visible:ring-sky-500/10 dark:border-slate-800";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";
const uploadBoxClass =
  "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-sky-200 bg-sky-50/40 transition-colors hover:border-sky-400 hover:bg-sky-50/70 dark:border-sky-500/25 dark:bg-sky-500/5";

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
  onCancel,
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
          <Card className={cardClass}>
            <CardHeader className="border-b border-sky-500/10 bg-sky-500/4">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className={labelClass}>
                    Danh mục <span className="text-sky-600">*</span>
                  </Label>
                  <Select
                    value={watch("categoryId")}
                    onValueChange={(v) => setValue("categoryId", v)}
                  >
                    <SelectTrigger className={fieldClass}>
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
                <div className="space-y-2">
                  <Label className={labelClass}>
                    Tên sản phẩm <span className="text-sky-600">*</span>
                  </Label>
                  <Input
                    {...register("name")}
                    placeholder="Ví dụ: Laptop"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Mô tả ngắn</Label>
                <Textarea
                  {...register("shortDescription")}
                  rows={2}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="min-h-[80px] rounded-md border border-slate-200 bg-background/50 text-sm focus-visible:border-sky-500 focus-visible:ring-3 focus-visible:ring-sky-500/10 dark:border-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Mô tả chi tiết</Label>
                <Textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Nhập chi tiết chất liệu, kích thước..."
                  className="rounded-md border border-slate-200 bg-background/50 text-sm focus-visible:border-sky-500 focus-visible:ring-3 focus-visible:ring-sky-500/10 dark:border-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 rounded-md border border-sky-500/15 bg-sky-500/4 px-4 py-3">
                <Checkbox
                  checked={watch("isActive")}
                  onCheckedChange={(c) => setValue("isActive", !!c)}
                  className="border-sky-300 data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600"
                />
                <Label className="text-sm font-medium">Hiển thị sản phẩm</Label>
              </div>
            </CardContent>
          </Card>

          {/* Giá sản phẩm */}
          <Card className={cardClass}>
            <CardHeader className="border-b border-sky-500/10 bg-sky-500/4">
              <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-slate-50">
                Giá sản phẩm
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-sky-500/25 hover:bg-sky-500/10 hover:text-sky-600"
                  onClick={() => appendPrice({ ...DEFAULT_PRICE })}
                >
                  <Plus className="mr-1 size-4" /> Thêm mức giá
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {priceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid grid-cols-1 gap-4 rounded-md border border-sky-500/15 bg-sky-500/3 p-5 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      Giá gốc <span className="text-sky-600">*</span>
                    </Label>
                    <Input
                      type="number"
                      className={fieldClass}
                      {...register(`prices.${index}.originalPrice`, {
                        valueAsNumber: true,
                      })}
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Giảm giá (%)</Label>
                    <Input
                      type="number"
                      className={fieldClass}
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
                      size="icon-sm"
                      className="absolute top-3 right-3 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removePrice(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="border-b border-sky-500/10 bg-sky-500/4">
              <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-slate-50">
                Biến thể
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-sky-500/25 hover:bg-sky-500/10 hover:text-sky-600"
                  onClick={handleAddVariant}
                >
                  <Plus className="mr-1 size-4" /> Thêm biến thể
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid grid-cols-1 gap-4 rounded-md border border-sky-500/15 bg-sky-500/3 p-5 md:grid-cols-3"
                >
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      Tên biến thể <span className="text-sky-600">*</span>
                    </Label>
                    <Input
                      {...register(`variants.${index}.title`)}
                      placeholder="Đen - Size L"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>SKU</Label>
                    <Input
                      {...register(`variants.${index}.sku`)}
                      placeholder="ATN-COTTON-DEN-L"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Tồn kho</Label>
                    <Input
                      type="number"
                      className={fieldClass}
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
                      size="icon-sm"
                      className="absolute top-3 right-3 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="border-b border-sky-500/10 bg-sky-500/4">
              <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-900 dark:text-slate-50">
                Thuộc tính
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-sky-500/25 hover:bg-sky-500/10 hover:text-sky-600"
                  onClick={() => appendAttribute({ ...DEFAULT_ATTRIBUTE })}
                >
                  <Plus className="mr-1 size-4" /> Thêm thuộc tính
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {attributeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative flex flex-col gap-3 rounded-md border border-sky-500/15 bg-sky-500/3 p-4 sm:flex-row"
                >
                  <Input
                    {...register(`attributes.${index}.name`)}
                    placeholder="Màu sắc"
                    className={fieldClass}
                  />
                  <Input
                    {...register(`attributes.${index}.value`)}
                    placeholder="Đen, Trắng, Xanh"
                    className={fieldClass}
                  />

                  {attributeFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-2 right-2 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 sm:static"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={cardClass}>
            <CardHeader className="border-b border-sky-500/10 bg-sky-500/4">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Thumbnail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <label className={`${uploadBoxClass} h-52`}>
                <Upload className="mb-2 size-10 text-sky-400" />
                <span className="text-sm font-medium text-sky-700/80 dark:text-sky-300/80">
                  Chọn ảnh đại diện
                </span>
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
                  className="mt-4 h-40 w-full rounded-md object-cover ring-1 ring-sky-500/20"
                  alt="thumbnail preview"
                />
              )}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="border-b border-sky-500/10 bg-sky-500/4">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <label className={`${uploadBoxClass} p-6`}>
                <Upload className="mb-2 size-8 text-sky-400" />
                <span className="text-sm font-medium text-sky-700/80 dark:text-sky-300/80">
                  Chọn nhiều ảnh gallery
                </span>
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
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {galleryFiles.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      className="h-24 rounded-md object-cover ring-1 ring-sky-500/20"
                      alt={`preview ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {currentImages.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Hình ảnh hiện tại
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {currentImages.map((image: ProductImage) => (
                      <div key={image.id} className="group relative">
                        <img
                          src={image.imageUrl}
                          className="h-24 w-full rounded-md object-cover ring-1 ring-sky-500/20"
                          alt=""
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleSetThumbnail(image.id)}
                            className="cursor-pointer rounded-md bg-white p-1 shadow hover:bg-sky-50"
                            title="Đặt làm thumbnail"
                          >
                            <Star
                              size={16}
                              className={image.isPrimary ? "fill-amber-400 text-amber-400" : "text-sky-600"}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            className="cursor-pointer rounded-md bg-white p-1 text-red-500 shadow hover:bg-red-50"
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

      <div className="flex justify-end gap-3 border-t border-sky-500/10 pt-6">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-md border-slate-200 px-5 font-semibold dark:border-slate-800"
          >
            Hủy
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 cursor-pointer rounded-md bg-sky-600 px-6 font-semibold text-white shadow-sm transition-all hover:bg-sky-700 active:scale-95"
        >
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
