import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import type { ITonKhoSanPham, INhaCungCap } from "@/features/inventory/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

type Props = {
  type: "product" | "supplier"
  items: (ITonKhoSanPham | INhaCungCap)[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function InventorySelectPopover({
  type,
  items,
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const isProduct = type === "product"
  const defaultPlaceholder = isProduct ? "Chọn sản phẩm..." : "Chọn nhà cung cấp..."
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder

  const selectedItem = React.useMemo(() => {
    if (isProduct) {
      return (items as ITonKhoSanPham[]).find((i) => i.id === value)
    }
    return (items as INhaCungCap[]).find((i) => i.ten === value)
  }, [items, value, isProduct])

  const filteredItems = React.useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()
    if (!cleanSearch) return items

    if (isProduct) {
      return (items as ITonKhoSanPham[]).filter(
        (item) =>
          item.tenSanPham.toLowerCase().includes(cleanSearch) ||
          item.sku.toLowerCase().includes(cleanSearch) ||
          (item.bienThe && item.bienThe.toLowerCase().includes(cleanSearch)),
      )
    }
    return (items as INhaCungCap[]).filter(
      (item) =>
        item.ten.toLowerCase().includes(cleanSearch) ||
        item.sdt.toLowerCase().includes(cleanSearch) ||
        item.diaChi.toLowerCase().includes(cleanSearch),
    )
  }, [items, search, isProduct])

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState)
    if (!openState) {
      setSearch("")
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-sm border border-primary/20 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-left cursor-pointer",
            className,
          )}
        >
          {selectedItem ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-6 shrink-0 overflow-hidden rounded-sm border border-primary/15 bg-muted">
                {selectedItem.anh ? (
                  <img
                    src={selectedItem.anh}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-primary/5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground leading-none">
                  {isProduct
                    ? (selectedItem as ITonKhoSanPham).tenSanPham
                    : (selectedItem as INhaCungCap).ten}
                </p>
                <p className="truncate text-[10px] text-muted-foreground mt-0.5 leading-none">
                  {isProduct ? (
                    <>
                      {(selectedItem as ITonKhoSanPham).bienThe} ·{" "}
                      {(selectedItem as ITonKhoSanPham).sku}
                    </>
                  ) : (
                    <>SĐT: {(selectedItem as INhaCungCap).sdt}</>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">{resolvedPlaceholder}</span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-55 ml-2 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="w-[320px] sm:w-[var(--radix-popover-trigger-width)] overflow-hidden p-0 shadow-lg border border-primary/15"
      >
        <div className="relative flex items-center border-b border-primary/10 px-3">
          <Search className="size-4 shrink-0 opacity-55 text-primary absolute left-3 pointer-events-none" />
          <input
            className="flex h-9 w-full bg-transparent py-2 pl-7 pr-3 text-xs outline-none placeholder:text-muted-foreground/70"
            placeholder={
              isProduct ? "Tìm theo tên, SKU..." : "Tìm theo tên, SĐT, địa chỉ..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className={isProduct ? "h-60" : "h-48"}>
          <div className="space-y-0.5 p-1">
            {filteredItems.length ? (
              filteredItems.map((item) => {
                const prod = item as ITonKhoSanPham
                const supp = item as INhaCungCap
                const isSelected = isProduct ? prod.id === value : supp.ten === value
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(isProduct ? prod.id : supp.ten)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-sm p-2 text-left text-xs transition-colors cursor-pointer select-none hover:bg-primary/5",
                      isSelected ? "bg-primary/10" : "bg-transparent",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-8 shrink-0 overflow-hidden rounded-sm border border-primary/15 bg-muted">
                        {item.anh ? (
                          <img
                            src={item.anh}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full bg-primary/5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground text-xs leading-normal">
                          {isProduct ? prod.tenSanPham : supp.ten}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground leading-normal">
                          {isProduct ? (
                            <>{prod.bienThe} · {prod.sku}</>
                          ) : (
                            <>{supp.sdt} · {supp.diaChi}</>
                          )}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                )
              })
            ) : (
              <p className="p-3 text-center text-xs text-muted-foreground">
                {isProduct ? "Không tìm thấy sản phẩm." : "Không tìm thấy nhà cung cấp."}
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
