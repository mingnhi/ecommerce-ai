import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from '@/shared/components/ui/toast';
import { PageSkeleton } from '@/shared/components/common/PageSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useVouchers, useDeleteVoucher } from '../hooks';
import { VoucherFormDialog } from '../components/VoucherFormDialog';
import { useUrlState } from '@/shared/hooks/use-url-state';
import type { Voucher } from '../types';

const URL_SCHEMA = {
  search: { type: 'string', default: '' },
  page: { type: 'number', default: 1 },
} as const;

const formatVnd = (v: string | number) => Number(v).toLocaleString('vi-VN') + 'đ';

export default function VouchersPage() {
  const [urlState, setUrlState] = useUrlState(URL_SCHEMA);
  const { search, page } = urlState;
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);

  const vouchers = useVouchers({ search, page, limit: 20 });
  const del = useDeleteVoucher();

  const remove = async (v: Voucher) => {
    if (!confirm(`Xoá voucher ${v.code}?`)) return;
    try {
      await del.mutateAsync(v.id);
      toast.success('Đã xoá');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Lỗi');
    }
  };

  const items = vouchers.data?.items ?? [];
  const meta = vouchers.data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Voucher</h1>
          <p className="text-sm text-slate-500">Quản lý mã giảm giá</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus size={16} className="mr-1" />
          Tạo voucher
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={search}
            onChange={(e) => setUrlState({ search: e.target.value, page: 1 })}
            placeholder="Tìm theo mã..."
            className="pl-9"
          />
        </div>
      </div>

      {vouchers.isLoading ? (
        <PageSkeleton filterCount={1} columnCount={7} rowCount={6} />
      ) : items.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-slate-500">
          Chưa có voucher nào
        </div>
      ) : (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Giảm</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Hạn dùng</TableHead>
                <TableHead className="text-center">Lượt dùng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((v) => {
                const expired = v.validUntil && new Date(v.validUntil) < new Date();
                const used =
                  v.usageLimit !== null &&
                  v.usageLimit !== undefined &&
                  v.usageCount >= v.usageLimit;
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-mono font-semibold">{v.code}</div>
                      {v.description && (
                        <div className="text-xs text-slate-500">{v.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {v.discountType === 'PERCENT'
                        ? `${Number(v.discountValue)}%${
                            v.maxDiscount ? ` (max ${formatVnd(v.maxDiscount)})` : ''
                          }`
                        : formatVnd(v.discountValue)}
                    </TableCell>
                    <TableCell>{formatVnd(v.minOrderAmount)}</TableCell>
                    <TableCell className="text-sm">
                      {v.validUntil
                        ? new Date(v.validUntil).toLocaleDateString('vi-VN')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {v.usageCount}
                      {v.usageLimit ? ` / ${v.usageLimit}` : ''}
                    </TableCell>
                    <TableCell className="text-center">
                      {!v.isActive ? (
                        <Badge variant="secondary">Tắt</Badge>
                      ) : expired ? (
                        <Badge variant="destructive">Hết hạn</Badge>
                      ) : used ? (
                        <Badge variant="destructive">Hết lượt</Badge>
                      ) : (
                        <Badge>Hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(v)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(v)}
                          className="text-red-600 hover:text-red-700 hover:cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setUrlState({ page: page - 1 })}
          >
            Prev
          </Button>
          <span className="px-3 py-1 text-sm">
            Trang {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setUrlState({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {openCreate && (
        <VoucherFormDialog
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      )}
      {editing && (
        <VoucherFormDialog
          open={!!editing}
          voucher={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
