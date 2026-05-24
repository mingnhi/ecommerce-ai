import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, Trash2, Star } from "lucide-react";
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
}

export const ProductForm = ({
  categories = [],
  initialData,
  loading = false,
  onSubmit,
}: Props) => {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      categoryId: "",
      name: "",
      shortDescription: "",
      description: "",
      isActive: true,
      prices: [{ originalPrice: 0, discountPercent: 0, price: 0, currency: "VND", isActive: true }],
      variants: [{ title: "", sku: "" }],
      attributes: [{ name: "", value: "" }],
      thumbnailFile: undefined,
      galleryFiles: [],
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = form;

  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();
  const thumbnailMutation = useSetProductThumbnail();

  useEffect(() => {
    if (!initialData) return;

    reset({
      categoryId: initialData.category.id,
      name: initialData.name,
      shortDescription: initialData.shortDescription || "",
      description: initialData.description || "",
      isActive: initialData.isActive,
      prices: initialData.prices || [],
      variants: initialData.variants?.length ? initialData.variants : [{ title: "", sku: "" }],
      attributes: initialData.attributes?.length ? initialData.attributes : [{ name: "", value: "" }],
      thumbnailFile: undefined,
      galleryFiles: [],
    });
  }, [initialData, reset]);

  const onSubmitHandler = async (values: ProductFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu sản phẩm");
    }
  };

  const galleryFiles = watch("galleryFiles") || [];
  const currentImages = initialData?.images || [];

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Danh mục</Label>
                  <Select value={watch("categoryId")} onValueChange={(value) => setValue("categoryId", value)}>
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
                  <Label>Tên sản phẩm *</Label>
                  <Input {...register("name")} required />
                </div>
              </div>

              <div>
                <Label>Mô tả ngắn</Label>
                <Textarea rows={3} {...register("shortDescription")} />
              </div>

              <div>
                <Label>Mô tả chi tiết</Label>
                <Textarea rows={6} {...register("description")} />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", !!checked)}
                />
                <Label>Hiển thị sản phẩm</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Variant</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input placeholder="Tên variant" {...register("variants.0.title")} />
              <Input placeholder="SKU" {...register("variants.0.sku")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Thuộc tính</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input placeholder="Tên thuộc tính" {...register("attributes.0.name")} />
              <Input placeholder="Giá trị" {...register("attributes.0.value")} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Giá sản phẩm</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input type="number" placeholder="Giá gốc" {...register("prices.0.originalPrice", { valueAsNumber: true })} />
              <Input type="number" placeholder="Phần trăm giảm giá" {...register("prices.0.discountPercent", { valueAsNumber: true })} />
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader><CardTitle>Thumbnail</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="border-2 border-dashed rounded-xl h-52 flex flex-col justify-center items-center cursor-pointer hover:bg-muted/50">
                <Upload className="mb-2" />
                <span>Upload thumbnail</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("thumbnailFile", file);
                  }}
                />
              </label>
              {watch("thumbnailFile") && (
                <img
                  src={URL.createObjectURL(watch("thumbnailFile") as File)}
                  className="h-40 w-full rounded-xl object-cover border"
                  alt="preview"
                />
              )}
            </CardContent>
          </Card>

          {/* Gallery - ĐÃ FIX */}
          <Card>
            <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="border-2 border-dashed rounded-xl h-52 flex flex-col justify-center items-center cursor-pointer hover:bg-muted/50">
                <Upload className="mb-2" />
                <span>Upload gallery</span>
                <input
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setValue("galleryFiles", files);
                  }}
                />
              </label>

              {/* Preview gallery files */}
              {galleryFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryFiles.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      className="aspect-square rounded-lg border object-cover"
                      alt={`preview-${index}`}
                    />
                  ))}
                </div>
              )}

              {/* Existing images */}
              {!!currentImages.length && (
                <div className="space-y-3">
                  <div className="font-medium">Ảnh hiện tại</div>
                  <div className="grid grid-cols-3 gap-3">
                    {currentImages.map((image: ProductImage) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.imageUrl}
                          className="aspect-square rounded-xl border object-cover"
                          alt=""
                        />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            type="button"
                            size="icon"
                            variant={image.isPrimary ? "default" : "secondary"}
                            onClick={() => thumbnailMutation.mutateAsync(image.id)}
                          >
                            <Star className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteMutation.mutateAsync(image.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
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

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="px-8">
          {loading ? "Đang xử lý..." : initialData ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
};