import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
  type Row,
} from "@tanstack/react-table"
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

const PAGE_SIZES = [5, 10, 20, 50] as const

export type FilterField =
  | {
    type: "search"
    placeholder: string
    value: string
    onChange: (v: string) => void
  }
  | {
    type: "select"
    placeholder: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
  }
  | {
    type: "date"
    label: string
    value: string
    onChange: (v: string) => void
  }

export type ToolbarConfig = {
  title?: string
  description?: string
  fields: FilterField[]
  onReset: () => void
}

export type DeleteConfig<T> = {
  title: string
  getConfirmName: (row: T) => string
  onConfirm: (row: T) => void
  confirmText?: string
  messageSuffix?: string
}

type DataTableBaseProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  filterKey: string
  highlightedRowId?: string | null
  emptyMessage?: string
  pageSizeLabel?: string
  mainColumnId?: string
  getSubRows?: (row: T) => T[] | undefined
  rowClassName?: (row: Row<T>) => string
  toolbarConfig?: ToolbarConfig
  deleteConfig?: DeleteConfig<T>
  defaultExpandedAll?: boolean
}

export function DataTableBase<T>({
  data,
  columns,
  filterKey,
  highlightedRowId,
  emptyMessage = "Không có dữ liệu phù hợp bộ lọc.",
  pageSizeLabel = "dòng / trang",
  mainColumnId,
  getSubRows,
  rowClassName,
  toolbarConfig,
  deleteConfig,
  defaultExpandedAll = false,
}: DataTableBaseProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [expanded, setExpanded] = React.useState<ExpandedState>(
    defaultExpandedAll ? true : {}
  )
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [deleteTarget, setDeleteTarget] = React.useState<T | null>(null)

  React.useEffect(() => {
    setPageIndex(0)
  }, [filterKey])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, expanded, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    meta: {
      onDeleteTarget: (row: T) => {
        setDeleteTarget(row)
      },
    },
  })

  const pageCount = table.getPageCount()
  const current = pageIndex + 1

  return (
    <div className="space-y-5">
      {/* Dynamic Toolbar */}
      {toolbarConfig && (
        <Card className="rounded-sm border-sky-500/20 bg-card/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-sky-500/5 dark:bg-card">
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-sm border border-sky-500/25 bg-sky-500/10">
                  <SlidersHorizontal className="size-4 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {toolbarConfig.title || "Bộ lọc"}
                  </p>
                  {toolbarConfig.description && (
                    <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
                      {toolbarConfig.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 rounded-full border-sky-500/25 px-4 text-xs hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
                onClick={toolbarConfig.onReset}
              >
                <RotateCcw className="size-3.5" />
                Đặt lại
              </Button>
            </div>
            <div
              className={cn(
                "grid gap-3",
                toolbarConfig.fields.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-4",
              )}
            >
              {toolbarConfig.fields.map((field, idx) => {
                if (field.type === "search") {
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "relative",
                        toolbarConfig.fields.length > 2 &&
                        "sm:col-span-2 lg:col-span-1",
                      )}
                    >
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sky-500/70" />
                      <Input
                        className="h-10 border-sky-500/20 bg-background pl-10 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:border-sky-500/40 focus-visible:ring-sky-500/20"
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-label="Tìm kiếm"
                      />
                    </div>
                  )
                }
                if (field.type === "select") {
                  return (
                    <Select
                      key={idx}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-10 py-5 w-full border-sky-500/20 bg-background text-sm focus:ring-sky-500/20">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                }
                if (field.type === "date") {
                  return (
                    <Input
                      key={idx}
                      className="h-10 border-sky-500/20 bg-background text-sm focus-visible:border-sky-500/40 focus-visible:ring-sky-500/20"
                      type="date"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      aria-label={field.label}
                    />
                  )
                }
                return null
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-sm border border-sky-500/20 bg-card shadow-sm ring-1 ring-sky-500/5">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-sky-500/15 bg-sky-500/[0.06] hover:bg-transparent"
              >
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={cn(
                      "whitespace-nowrap h-11 bg-sky-500/[0.07] text-sm font-medium text-muted-foreground dark:bg-sky-500/10",
                      h.column.id === "expander" && "w-10 px-2",
                      h.column.id === "total" && "text-right",
                      h.column.id === "actions" && "pr-3 pl-2",
                    )}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const resolvedRowClass = rowClassName
                  ? rowClassName(row)
                  : cn(
                    "border-sky-500/10 transition-colors",
                    highlightedRowId && (row.original as { id?: string }).id === highlightedRowId
                      ? "bg-rose-500/15 hover:bg-rose-500/20"
                      : "hover:bg-sky-500/[0.03]",
                  )

                return (
                  <TableRow key={row.id} className={resolvedRowClass}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3 align-middle",
                          cell.column.id === "expander" && "w-10 px-2",
                          cell.column.id === mainColumnId && "align-top",
                          cell.column.id === "actions" && "pr-3 pl-2",
                        )}
                      >
                        {cell.column.id === mainColumnId && row.depth > 0 ? (
                          <div style={{ paddingLeft: `${row.depth * 12}px` }}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        ) : (
                          flexRender(
                             cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-4 rounded-sm border border-sky-500/20 bg-card px-4 py-3.5 ring-1 ring-sky-500/5 sm:flex-row sm:items-center sm:justify-between dark:bg-card">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Hiển thị</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPageIndex(0)
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-18 border-sky-500/25 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden sm:inline">{pageSizeLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs tabular-nums text-muted-foreground">
            Trang {pageCount ? current : 0} / {pageCount || 1}
          </p>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-sky-500/25 px-3 text-xs hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-sky-500/25 px-3 text-xs hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* Generic Delete Confirmation Dialog */}
      {deleteTarget && deleteConfig && (
        <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent showCloseButton className="gap-0 p-0 sm:max-w-sm">
            <DialogHeader className="px-5 pt-5 pb-2 text-left">
              <DialogTitle className="text-base">{deleteConfig.title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {deleteConfig.title.includes("sản phẩm") ? "Sản phẩm " : "Đơn "}
                <span className="font-medium text-foreground">
                  {deleteConfig.getConfirmName(deleteTarget)}
                </span>{" "}
                {deleteConfig.messageSuffix || "sẽ bị gỡ khỏi danh sách. Thao tác không hoàn tác."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full border-sky-500/20 sm:w-auto hover:cursor-pointer"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto hover:cursor-pointer"
                onClick={() => {
                  deleteConfig.onConfirm(deleteTarget)
                  setDeleteTarget(null)
                }}
              >
                {deleteConfig.confirmText || "Xóa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
