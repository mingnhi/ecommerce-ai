import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { ProductForm } from "./product-form";
import type { Product, ProductFormValues } from "../types/product.type";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product;
  categories: { id: string; name: string }[];
  loading?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<any>;
  /** Được gọi sau khi ProductForm hoàn tất toàn bộ flow (kể cả upload ảnh) */
  onSuccess?: (slug?: string) => void;
}

export const ProductDialog = ({
  open,
  onOpenChange,
  initialData,
  categories,
  loading = false,
  onSubmit,
  onSuccess,
}: Props) => {
  const handleSuccess = (slug?: string) => {
    onOpenChange(false);
    onSuccess?.(slug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1400px] h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Chỉnh sửa thông tin sản phẩm"
              : "Nhập thông tin sản phẩm mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <ProductForm
            categories={categories}
            initialData={initialData}
            loading={loading}
            onSubmit={onSubmit}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
