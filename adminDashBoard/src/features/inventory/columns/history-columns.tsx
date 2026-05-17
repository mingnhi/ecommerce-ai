import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Trash2 } from "lucide-react"
import { LoaiBienDongKho, LOAI_BIEN_DONG_LABEL, type ILichSuKho } from "@/features/inventory/types"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function buildMovementHistoryColumns(
  onView: (movement: ILichSuKho) => void,
): ColumnDef<ILichSuKho>[] {
  return [
    {
      accessorKey: "thoiGian",
      header: "Thời gian",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatTime(row.original.thoiGian)}
        </span>
      ),
    },
    {
      id: "sanPham",
      accessorKey: "tenSanPham",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="truncate text-sm font-medium text-foreground">
            {row.original.tenSanPham}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.sku}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "loai",
      header: "Loại biến động",
      cell: ({ row }) => {
        const loai = row.original.loai
        const tone: Record<LoaiBienDongKho, string> = {
          [LoaiBienDongKho.NHAP_KHO]:
            "border-sky-500/35 bg-sky-500/10 text-sky-900 dark:text-sky-100",
          [LoaiBienDongKho.GIU_HANG]:
            "border-orange-500/35 bg-orange-500/10 text-orange-900 dark:text-orange-100",
          [LoaiBienDongKho.TRA_GIU_HANG]:
            "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100",
          [LoaiBienDongKho.BAN_HANG]:
            "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100",
          [LoaiBienDongKho.DIEU_CHINH]:
            "border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-100",
        }
        return (
          <span
            className={cn(
              "inline-flex rounded-sm border px-2.5 py-0.5 text-xs font-medium",
              tone[loai],
            )}
          >
            {LOAI_BIEN_DONG_LABEL[loai]}
          </span>
        )
      },
    },
    {
      accessorKey: "soLuong",
      header: () => <span className="block text-right">Số lượng</span>,
      cell: ({ row }) => {
        const qty = row.original.soLuong
        return (
          <span
            className={`block text-right tabular-nums text-sm font-medium ${
              qty > 0 ? "text-emerald-600" : qty < 0 ? "text-rose-600" : ""
            }`}
          >
            {qty > 0 ? `+${qty}` : qty}
          </span>
        )
      },
    },
    {
      accessorKey: "truocThayDoi",
      header: () => <span className="block text-right">Trước</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-sm text-muted-foreground">
          {row.original.truocThayDoi}
        </span>
      ),
    },
    {
      accessorKey: "sauThayDoi",
      header: () => <span className="block text-right">Sau</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-sm font-medium text-foreground">
          {row.original.sauThayDoi}
        </span>
      ),
    },
    {
      accessorKey: "ghiChu",
      header: "Ghi chú",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.original.ghiChu || "—"}
        </span>
      ),
    },
    {
      accessorKey: "nguoiThaoTac",
      header: "Người thao tác",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.nguoiThaoTac}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Thao tác</span>,
      cell: ({ row, table }) => {
        const meta = table.options.meta as { onDeleteTarget?: (row: ILichSuKho) => void } | undefined
        return (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-sm hover:cursor-pointer"
              onClick={() => onView(row.original)}
              aria-label="Xem chi tiết phiếu"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-sm hover:cursor-pointer"
              onClick={() => meta?.onDeleteTarget?.(row.original)}
              aria-label="Xóa lịch sử"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
