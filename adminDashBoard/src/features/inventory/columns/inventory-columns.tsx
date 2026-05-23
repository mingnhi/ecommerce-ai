/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import { Trash2, Minus, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react"
import type { TonKhoRow } from "@/features/inventory/lib"
import { TRANG_THAI_TON_LABEL } from "@/features/inventory/types"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Can } from "@/shared/components/common/Can"
import { useCan } from "@/shared/hooks/use-can"
import { PERMISSIONS } from "@/shared/lib/casl/permissions"

function ThresholdInput({
  initialValue,
  onSave,
}: {
  initialValue: number
  onSave: (value: number) => void
}) {
  const [value, setValue] = React.useState(initialValue.toString())
  const [prevInitialValue, setPrevInitialValue] = React.useState(initialValue)

  if (initialValue !== prevInitialValue) {
    setValue(initialValue.toString())
    setPrevInitialValue(initialValue)
  }

  const handleBlur = () => {
    const v = Number(value)
    if (!Number.isNaN(v) && v >= 0) {
      onSave(v)
    } else {
      setValue(initialValue.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const handleDecrement = () => {
    const v = Number(value)
    if (!Number.isNaN(v) && v > 0) {
      const nextVal = v - 1
      setValue(nextVal.toString())
      onSave(nextVal)
    }
  }

  const handleIncrement = () => {
    const v = Number(value)
    if (!Number.isNaN(v)) {
      const nextVal = v + 1
      setValue(nextVal.toString())
      onSave(nextVal)
    }
  }

  return (
    <div className="flex justify-center w-full">
      <div className="flex h-8 w-28 items-center overflow-hidden rounded-sm border border-sky-500/20 bg-background/50 transition-all hover:border-sky-500/40 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/10 shadow-xs">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-full w-8 items-center justify-center bg-transparent text-muted-foreground hover:bg-sky-500/5 hover:text-sky-500 transition-colors border-r border-sky-500/10 select-none cursor-pointer"
        >
          <Minus className="size-3" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const clean = e.target.value.replace(/[^0-9]/g, "")
            setValue(clean)
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-full w-full bg-transparent border-0 outline-none text-center font-medium text-xs tabular-nums text-foreground p-0 focus-visible:ring-0 focus-visible:border-0"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-full w-8 items-center justify-center bg-transparent text-muted-foreground hover:bg-sky-500/5 hover:text-sky-500 transition-colors border-l border-sky-500/10 select-none cursor-pointer"
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  )
}

function ThresholdCell({
  value,
  onSave,
}: {
  value: number
  onSave: (next: number) => void
}) {
  const canUpdate = useCan(PERMISSIONS.INVENTORY.UPDATE_THRESHOLD)

  if (!canUpdate) {
    return (
      <span className="block text-center text-sm font-medium tabular-nums text-foreground">
        {value}
      </span>
    )
  }

  return <ThresholdInput initialValue={value} onSave={onSave} />
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type Handlers = {
  onAdjust: (row: TonKhoRow) => void
  onThreshold: (id: string, value: number) => void
  onDemoReserve: (row: TonKhoRow) => void
  onDemoRelease: (row: TonKhoRow) => void
  onDemoSell: (row: TonKhoRow) => void
  onDemoReturn: (row: TonKhoRow) => void
  onDemoUnreturn: (row: TonKhoRow) => void
  onDemoUnsell: (row: TonKhoRow) => void
}

type ActionsCellProps = {
  row: Row<TonKhoRow>
  table: Table<TonKhoRow>
  handlers: Handlers
}

type QuantityStepperProps = {
  label: string
  value: number
  disableDecrement: boolean
  disableIncrement: boolean
  onDecrement: () => void
  onIncrement: () => void
}

function QuantityStepper({
  label,
  value,
  disableDecrement,
  disableIncrement,
  onDecrement,
  onIncrement,
}: QuantityStepperProps) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()
  return (
    <div
      className="flex items-center justify-between px-2.5 py-1.5 hover:bg-muted/50 transition-colors rounded-sm"
      onPointerDown={stop}
    >
      <span className="font-medium text-foreground text-xs">{label}</span>
      <div className="flex h-7 w-24 items-center overflow-hidden rounded-sm border border-sky-500/20 bg-background/50">
        <button
          type="button"
          disabled={disableDecrement}
          onClick={(e) => {
            e.stopPropagation()
            onDecrement()
          }}
          className="flex h-full w-8 items-center justify-center bg-transparent text-muted-foreground hover:bg-sky-500/5 hover:text-sky-500 transition-colors disabled:opacity-30 disabled:pointer-events-none border-r border-sky-500/10 select-none cursor-pointer"
        >
          <Minus className="size-3" />
        </button>
        <div className="w-8 text-center font-semibold text-xs tabular-nums text-foreground select-none">
          {value}
        </div>
        <button
          type="button"
          disabled={disableIncrement}
          onClick={(e) => {
            e.stopPropagation()
            onIncrement()
          }}
          className="flex h-full w-8 items-center justify-center bg-transparent text-muted-foreground hover:bg-sky-500/5 hover:text-sky-500 transition-colors disabled:opacity-30 disabled:pointer-events-none border-l border-sky-500/10 select-none cursor-pointer"
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  )
}

function ActionsCell({ row, table, handlers }: ActionsCellProps) {
  const r = row.original

  const handleDelete = () => {
    const meta = table.options.meta as {
      onDeleteTarget?: (row: TonKhoRow) => void
    }
    meta?.onDeleteTarget?.(r)
  }

  return (
    <div className="flex justify-end gap-0.5">
      <Can permission={PERMISSIONS.INVENTORY.ADJUST}>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
          aria-label="Chỉnh tồn"
          onClick={() => handlers.onAdjust(r)}
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </Can>
      <Can permission={PERMISSIONS.INVENTORY.DELETE}>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:cursor-pointer"
          aria-label="Xóa"
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </Can>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
            aria-label="Mô phỏng giữ hàng"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 p-1.5 space-y-1"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <QuantityStepper
            label="Giữ hàng"
            value={r.dangGiu}
            disableDecrement={r.dangGiu < 1}
            disableIncrement={r.tonKhaDung < 1}
            onDecrement={() => handlers.onDemoRelease(r)}
            onIncrement={() => handlers.onDemoReserve(r)}
          />
          <QuantityStepper
            label="Trả hàng"
            value={r.soLuongHoanTra}
            disableDecrement={r.soLuongHoanTra < 1}
            disableIncrement={r.daBan < 1}
            onDecrement={() => handlers.onDemoUnreturn(r)}
            onIncrement={() => handlers.onDemoReturn(r)}
          />
          <QuantityStepper
            label="Hoàn tất bán"
            value={r.daBan}
            disableDecrement={r.daBan < 1}
            disableIncrement={r.dangGiu < 1}
            onDecrement={() => handlers.onDemoUnsell(r)}
            onIncrement={() => handlers.onDemoSell(r)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function buildInventoryColumns(
  handlers: Handlers,
): ColumnDef<TonKhoRow>[] {
  return [
    {
      id: "product",
      accessorKey: "tenSanPham",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">Sản phẩm</span>
      ),
      cell: ({ row }) => {
        const r = row.original
        return (
          <div className="flex min-w-[200px] items-center gap-3">
            <div className="size-11 shrink-0 overflow-hidden rounded-sm border border-sky-500/20 bg-muted">
              {r.anh ? (
                <img src={r.anh} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {r.tenSanPham}
              </p>
              <p className="truncate text-xs text-muted-foreground">{r.bienThe}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "sku",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">SKU</span>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: "tonKhaDung",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">
          Tồn khả dụng
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums">
          {row.original.tonKhaDung}
        </span>
      ),
    },
    {
      accessorKey: "dangGiu",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">Đang giữ</span>
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-orange-600 dark:text-orange-400">
          {row.original.dangGiu}
        </span>
      ),
    },
    {
      accessorKey: "daBan",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">Đã bán</span>
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-green-600 dark:text-green-400 font-medium">
          {row.original.daBan}
        </span>
      ),
    },
    {
      accessorKey: "nguongCanhBao",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">
          Ngưỡng cảnh báo
        </span>
      ),
      cell: ({ row }) => (
        <ThresholdCell
          value={row.original.nguongCanhBao}
          onSave={(val) => handlers.onThreshold(row.original.id, val)}
        />
      ),
    },
    {
      id: "trangThai",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">Trạng thái</span>
      ),
      cell: ({ row }) => {
        const status = row.original.trangThai
        const tone = {
          CON_HANG:
            "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100",
          SAP_HET_HANG:
            "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100",
          HET_HANG:
            "border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-100",
        }
        return (
          <span
            className={cn(
              "inline-flex rounded-sm border px-2.5 py-0.5 text-xs font-medium",
              tone[status],
            )}
          >
            {TRANG_THAI_TON_LABEL[status]}
          </span>
        )
      },
    },
    {
      accessorKey: "capNhatLuc",
      header: () => (
        <span className="text-sm font-medium text-muted-foreground">
          Cập nhật lần cuối
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(row.original.capNhatLuc)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <span className="block text-right text-sm font-medium text-muted-foreground">
          Thao tác
        </span>
      ),
      cell: ({ row, table }) => (
        <ActionsCell row={row} table={table} handlers={handlers} />
      ),
    },
  ]
}
