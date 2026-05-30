import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCreateVoucher, useUpdateVoucher } from "../hooks/vouchers";
import type { Voucher, VoucherFormValues } from "../types/voucher.type";

type Props = {
  open: boolean;
  onClose: () => void;
  voucher?: Voucher | null;
};

const defaultValues: VoucherFormValues = {
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 0,
  minOrderAmount: 0,
  isActive: true,
};

export function VoucherFormDialog({ open, onClose, voucher }: Props) {
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const isEdit = Boolean(voucher);

  const form = useForm<VoucherFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (voucher) {
      form.reset({
        code: voucher.code,
        description: voucher.description ?? "",
        discountType: voucher.discountType,
        discountValue: Number(voucher.discountValue),
        minOrderAmount: Number(voucher.minOrderAmount),
        maxDiscount: voucher.maxDiscount != null ? Number(voucher.maxDiscount) : undefined,
        validUntil: voucher.validUntil ?? undefined,
        usageLimit: voucher.usageLimit ?? undefined,
        isActive: voucher.isActive,
      });
      return;
    }
    form.reset(defaultValues);
  }, [open, voucher, form]);

  const onSubmit = async (values: VoucherFormValues) => {
    try {
      if (isEdit && voucher) {
        await updateMutation.mutateAsync({ id: voucher.id, payload: values });
        toast.success("Cập nhật voucher thành công");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Tạo voucher thành công");
      }
      onClose();
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message ?? "Không thể lưu voucher");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa voucher" : "Tạo voucher"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Mã voucher</Label>
            <Input id="code" {...form.register("code", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input id="description" {...form.register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Loại giảm</Label>
              <Select
                value={form.watch("discountType")}
                onValueChange={(value: VoucherFormValues["discountType"]) =>
                  form.setValue("discountType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Phần trăm</SelectItem>
                  <SelectItem value="FIXED">Số tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">Giá trị</Label>
              <Input
                id="discountValue"
                type="number"
                {...form.register("discountValue", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Đơn tối thiểu</Label>
            <Input
              id="minOrderAmount"
              type="number"
              {...form.register("minOrderAmount", { valueAsNumber: true })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
