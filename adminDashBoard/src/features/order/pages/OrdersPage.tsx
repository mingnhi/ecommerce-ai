import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useUrlState } from "@/shared/hooks/use-url-state";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from "@/shared/components/ui/toast";
import {
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  useBulkUpdateOrderStatus,
} from "../hooks";
import type { OrderStatus } from "../types";

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "success" | "warning" | "danger" | "outline"> = {
  PENDING: "warning",
  PAID: "default",
  SHIPPED: "secondary",
  COMPLETED: "success",
  CANCELLED: "danger",
  REFUNDED: "outline",
};

const URL_SCHEMA = {
  status: { type: 'string', default: '' },
  userId: { type: 'string', default: '' },
  page: { type: 'number', default: 1 },
} as const;

export default function OrdersPage() {
  const [urlState, setUrlState] = useUrlState(URL_SCHEMA);
  const { status: statusFilter, userId, page } = urlState;
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PAID");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("SHIPPED");

  const orders = useOrders({
    status: (statusFilter || undefined) as OrderStatus | undefined,
    userId: userId || undefined,
    page,
    limit: 20,
  });
  const orderDetail = useOrder(openOrderId || undefined);
  const update = useUpdateOrderStatus();
  const bulkUpdate = useBulkUpdateOrderStatus();

  const onUpdateStatus = async () => {
    if (!openOrderId) return;
    try {
      await update.mutateAsync({ id: openOrderId, status: newStatus });
      toast.success(`Đã chuyển → ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Lỗi");
    }
  };

  const allItems = orders.data?.items ?? [];
  const allChecked = allItems.length > 0 && allItems.every((o) => selectedIds.has(o.id));
  const someChecked = allItems.some((o) => selectedIds.has(o.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        allItems.forEach((o) => next.delete(o.id));
      } else {
        allItems.forEach((o) => next.add(o.id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onBulkUpdate = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Chuyển ${ids.length} đơn sang trạng thái ${bulkStatus}?`)) return;
    try {
      const result = await bulkUpdate.mutateAsync({ orderIds: ids, status: bulkStatus });
      if (result.failedCount === 0) {
        toast.success(`Đã cập nhật ${result.succeededCount} đơn`);
      } else {
        toast.error(
          `Thành công ${result.succeededCount}, thất bại ${result.failedCount}. ` +
            `Vd lỗi: ${result.failed[0]?.reason ?? "—"}`,
        );
      }
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Lỗi");
    }
  };

  const exportToExcel = () => {
    if (allItems.length === 0) {
      toast.error("Không có đơn để export");
      return;
    }
    const rows = allItems.map((o) => ({
      'Order ID': o.id,
      'User ID': o.userId,
      'Trạng thái': o.status,
      'Tổng tiền (VND)': Number(o.totalPrice ?? 0),
      'SĐT': o.phone ?? '',
      'Địa chỉ': o.shippingAddress ?? '',
      'Ghi chú': o.note ?? '',
      'Ngày đặt': new Date(o.createdAt).toLocaleString('vi-VN'),
      'Thanh toán': o.paidAt ? new Date(o.paidAt).toLocaleString('vi-VN') : '',
      'Giao hàng': o.shippedAt ? new Date(o.shippedAt).toLocaleString('vi-VN') : '',
      'Hoàn tất': o.completedAt ? new Date(o.completedAt).toLocaleString('vi-VN') : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const filename = `orders-${statusFilter || 'all'}-page${page}-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success(`Đã export ${rows.length} đơn → ${filename}`);
  };

  const meta = orders.data?.meta;
  const selectedCount = useMemo(
    () => allItems.filter((o) => selectedIds.has(o.id)).length,
    [allItems, selectedIds],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-slate-500">Quản lý đơn hàng (admin scope)</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToExcel} disabled={allItems.length === 0}>
          <Download size={14} className="mr-1" />
          Export Excel
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select
          className="w-48"
          value={statusFilter}
          onChange={(e) => setUrlState({ status: e.target.value, page: 1 })}
        >
          <option value="">Tất cả status</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </Select>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} đơn đã chọn:
            </span>
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
              className="w-40"
            >
              <option value="SHIPPED">→ SHIPPED</option>
              <option value="COMPLETED">→ COMPLETED</option>
              <option value="CANCELLED">→ CANCELLED</option>
              <option value="REFUNDED">→ REFUNDED</option>
            </Select>
            <Button size="sm" onClick={onBulkUpdate} disabled={bulkUpdate.isPending}>
              {bulkUpdate.isPending ? "..." : "Áp dụng"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Bỏ chọn
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        {orders.isLoading ? (
          <div className="p-8 flex justify-center"><Spinner size={20} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={toggleAll}
                    className="w-4 h-4"
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Không có order
                  </TableCell>
                </TableRow>
              ) : (
                orders.data?.items.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Chọn order ${o.id.slice(0, 8)}`}
                        checked={selectedIds.has(o.id)}
                        onChange={() => toggleOne(o.id)}
                        className="w-4 h-4"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-mono text-xs">{o.userId.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[o.status]}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(o.totalPrice).toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>{o.phone ?? "-"}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => {
                        setOpenOrderId(o.id);
                        setNewStatus(o.status);
                      }}>
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {meta.page}/{meta.totalPages} (total {meta.total})</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setUrlState({ page: page - 1 })}>Prev</Button>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setUrlState({ page: page + 1 })}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={!!openOrderId} onOpenChange={(v) => !v && setOpenOrderId(null)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order detail</DialogTitle>
          <div className="text-xs font-mono text-slate-500 mt-1">{openOrderId}</div>
        </DialogHeader>
        <DialogContent className="max-h-[60vh] overflow-y-auto space-y-4">
          {!orderDetail.data ? (
            <Spinner size={20} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Badge variant={STATUS_VARIANTS[orderDetail.data.status]}>
                  {orderDetail.data.status}
                </Badge>
                <div className="text-lg font-semibold">
                  {Number(orderDetail.data.totalPrice).toLocaleString("vi-VN")}đ
                </div>
              </div>

              <div className="text-sm">
                <strong>Ship to:</strong> {orderDetail.data.shippingAddress} —{" "}
                {orderDetail.data.phone}
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Items</div>
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {orderDetail.data.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="py-1 font-mono text-xs">{it.variantId.slice(0, 8)}</td>
                        <td className="py-1 text-right">×{it.quantity}</td>
                        <td className="py-1 text-right">{Number(it.subtotal).toLocaleString("vi-VN")}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Timeline</div>
                <div className="space-y-1 text-sm">
                  {orderDetail.data.timeline?.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge variant="outline">{t.actor}</Badge>
                      <span>{t.fromStatus ?? "—"} → {t.toStatus}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(t.at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">Cập nhật trạng thái</div>
                <div className="flex gap-2">
                  <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}>
                    <option value="PAID">PAID (manual, SYSTEM only — sẽ fail)</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </Select>
                  <Button onClick={onUpdateStatus} disabled={update.isPending}>
                    Cập nhật
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenOrderId(null)}>Đóng</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
