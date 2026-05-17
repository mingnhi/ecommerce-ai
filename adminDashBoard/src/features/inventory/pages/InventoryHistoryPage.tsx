import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { useInventory } from "@/features/inventory/hook"
import { filterLichSu } from "@/features/inventory/lib"
import type { MovementHistoryFilters, ILichSuKho } from "@/features/inventory/types"
import { buildMovementHistoryColumns } from "@/features/inventory/columns/history-columns"
import { DataTableBase } from "@/shared/components/common/DataTableBase"
import { InventoryActionDialog } from "@/features/inventory/components/InventoryActionDialog"

const defaultFilters: MovementHistoryFilters = {
  loai: "all",
  tuNgay: "",
  denNgay: "",
  search: "",
}

export default function InventoryHistoryPage() {
  const [searchParams] = useSearchParams()
  const inv = useInventory()

  const [filters, setFilters] = React.useState<MovementHistoryFilters>(() => ({
    ...defaultFilters,
    search: searchParams.get("sku") ?? "",
  }))

  const [viewMovement, setViewMovement] = React.useState<ILichSuKho | null>(null)

  const rows = React.useMemo(() => {
    const allowed = inv.movements.filter(
      (m) => m.loai === "NHAP_KHO" || m.loai === "DIEU_CHINH" || m.loai === "BAN_HANG"
    )
    return filterLichSu(allowed, filters)
  }, [inv.movements, filters])

  const filterKey = React.useMemo(
    () =>
      [filters.search, filters.loai, filters.tuNgay, filters.denNgay, rows.length].join(
        "|",
      ),
    [filters, rows.length],
  )

  const columns = React.useMemo(() => buildMovementHistoryColumns(setViewMovement), [])

  const deleteConfig = React.useMemo(() => ({
    title: "Xóa lịch sử biến động kho?",
    getConfirmName: (row: ILichSuKho) => `${row.tenSanPham} (SKU: ${row.sku})`,
    onConfirm: (row: ILichSuKho) => inv.deleteMovement(row.id),
    confirmText: "Xóa lịch sử",
    messageSuffix: "sẽ bị gỡ khỏi danh sách biến động. Thao tác không hoàn tác.",
  }), [inv])

  const toolbarConfig = React.useMemo(() => ({
    title: "Bộ lọc",
    description: "Tìm theo sản phẩm, SKU, loại biến động và khoảng thời gian",
    onReset: () => setFilters(defaultFilters),
    fields: [
      {
        type: "search" as const,
        placeholder: "Sản phẩm hoặc SKU...",
        value: filters.search,
        onChange: (v: string) => setFilters((f) => ({ ...f, search: v })),
      },
      {
        type: "select" as const,
        placeholder: "Loại biến động",
        value: filters.loai,
        onChange: (v: string) => setFilters((f) => ({ ...f, loai: v as MovementHistoryFilters["loai"] })),
        options: [
          { value: "all", label: "Tất cả loại" },
          { value: "NHAP_KHO", label: "Nhập kho" },
          { value: "DIEU_CHINH", label: "Sửa đổi" },
          { value: "BAN_HANG", label: "Bán hàng (Xuất)" },
        ],
      },
      {
        type: "date" as const,
        label: "Từ ngày",
        value: filters.tuNgay,
        onChange: (v: string) => setFilters((f) => ({ ...f, tuNgay: v })),
      },
      {
        type: "date" as const,
        label: "Đến ngày",
        value: filters.denNgay,
        onChange: (v: string) => setFilters((f) => ({ ...f, denNgay: v })),
      },
    ],
  }), [filters, setFilters])

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <DataTableBase
        data={rows}
        columns={columns}
        filterKey={filterKey}
        emptyMessage="Không có lịch sử phù hợp bộ lọc."
        pageSizeLabel="dòng / trang"
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
      />
      <InventoryActionDialog
        open={!!viewMovement}
        onOpenChange={(open) => {
          if (!open) setViewMovement(null)
        }}
        mode="view"
        movement={viewMovement}
      />
    </div>
  )
}
