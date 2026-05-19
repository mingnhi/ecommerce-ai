import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { toast } from '@/shared/components/ui/toast';
import { useCreateVoucher, useUpdateVoucher } from '../hooks';
import type { Voucher, VoucherDiscountType } from '../types';

const schema = z.object({
  code: z
    .string()
    .min(2, 'Code tối thiểu 2 ký tự')
    .max(50, 'Code tối đa 50 ký tự')
    .regex(/^[A-Z0-9_-]+$/, 'Chỉ chứa A-Z, 0-9, _, -'),
  description: z.string().max(200).optional(),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.string().regex(/^\d+(\.\d+)?$/, 'Phải là số dương'),
  minOrderAmount: z.string().regex(/^\d+(\.\d+)?$/).optional().or(z.literal('')),
  maxDiscount: z.string().regex(/^\d+(\.\d+)?$/).optional().or(z.literal('')),
  validFrom: z.string().optional().or(z.literal('')),
  validUntil: z.string().optional().or(z.literal('')),
  usageLimit: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  voucher?: Voucher;
  onClose: () => void;
}

const toDateInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16);
};

export function VoucherFormDialog({ open, voucher, onClose }: Props) {
  const create = useCreateVoucher();
  const update = useUpdateVoucher();
  const isEdit = !!voucher;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: '10',
      minOrderAmount: '0',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && voucher) {
      reset({
        code: voucher.code,
        description: voucher.description ?? '',
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderAmount: voucher.minOrderAmount,
        maxDiscount: voucher.maxDiscount ?? '',
        validFrom: toDateInput(voucher.validFrom),
        validUntil: toDateInput(voucher.validUntil),
        usageLimit: voucher.usageLimit?.toString() ?? '',
        isActive: voucher.isActive,
      });
    } else if (open) {
      reset();
    }
  }, [open, voucher, reset]);

  const discountType = watch('discountType') as VoucherDiscountType;

  const onSubmit = async (values: FormValues) => {
    const payload = {
      description: values.description || undefined,
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrderAmount: values.minOrderAmount || '0',
      maxDiscount: values.maxDiscount || undefined,
      validFrom: values.validFrom ? new Date(values.validFrom).toISOString() : undefined,
      validUntil: values.validUntil ? new Date(values.validUntil).toISOString() : undefined,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
      isActive: values.isActive,
    };

    try {
      if (isEdit && voucher) {
        await update.mutateAsync({ id: voucher.id, input: payload });
        toast.success('Cập nhật OK');
      } else {
        await create.mutateAsync({ code: values.code.toUpperCase(), ...payload });
        toast.success('Tạo voucher OK');
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Lỗi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa voucher' : 'Tạo voucher'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Mã *</Label>
            <Input
              {...register('code')}
              disabled={isEdit}
              placeholder="SUMMER10"
              className="uppercase font-mono"
            />
            {errors.code && (
              <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label>Mô tả</Label>
            <Input {...register('description')} placeholder="Giảm 10% mùa hè..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kiểu giảm *</Label>
              <select
                {...register('discountType')}
                className="w-full h-9 rounded-md border px-3 text-sm"
              >
                <option value="PERCENT">Phần trăm</option>
                <option value="FIXED">Cố định (VND)</option>
              </select>
            </div>
            <div>
              <Label>Giá trị * {discountType === 'PERCENT' ? '(%)' : '(VND)'}</Label>
              <Input
                {...register('discountValue')}
                type="text"
                placeholder={discountType === 'PERCENT' ? '10' : '50000'}
              />
              {errors.discountValue && (
                <p className="text-xs text-red-600 mt-1">{errors.discountValue.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Đơn tối thiểu (VND)</Label>
              <Input {...register('minOrderAmount')} placeholder="0" />
            </div>
            {discountType === 'PERCENT' && (
              <div>
                <Label>Giảm tối đa (VND)</Label>
                <Input {...register('maxDiscount')} placeholder="Không cap" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bắt đầu</Label>
              <Input type="datetime-local" {...register('validFrom')} />
            </div>
            <div>
              <Label>Kết thúc</Label>
              <Input type="datetime-local" {...register('validUntil')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <Label>Giới hạn lượt dùng</Label>
              <Input {...register('usageLimit')} type="number" min={1} placeholder="∞" />
            </div>
            <label className="flex items-center gap-2 pb-2">
              <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
              <span className="text-sm">Hoạt động</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
