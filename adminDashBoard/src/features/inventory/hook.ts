import * as React from "react"
import {
  MOCK_LICH_SU_KHO,
  MOCK_PHIEU_NHAP,
  MOCK_PHIEN_KIEM,
  MOCK_TON_KHO,
} from "@/faker/mock-inventory"
import { getTrangThaiTonKho, createMovement, canApplyMovement } from "@/features/inventory/lib"
import {
  LoaiBienDongKho,
  type IPhieuNhapKho,
  type IPhienKiemKho,
  type ILichSuKho,
  type InventoryStats,
  type ITonKhoSanPham,
} from "@/features/inventory/types"
import type { AdjustStockForm, ImportStockForm, StockCheckForm } from "@/shared/lib/validations/inventory-schema"

function computeStats(items: ITonKhoSanPham[]): InventoryStats {
  const productIds = new Set(items.map((i) => i.productId))
  return {
    tongSanPham: productIds.size,
    tongBienThe: items.length,
    tongTonKho: items.reduce((s, i) => s + i.tonKhaDung, 0),
    dangGiu: items.reduce((s, i) => s + i.dangGiu, 0),
    daBan: items.reduce((s, i) => s + i.daBan, 0),
    sapHetHang: items.filter(
      (i) => getTrangThaiTonKho(i.tonKhaDung, i.nguongCanhBao) === "SAP_HET_HANG",
    ).length,
    hetHang: items.filter(
      (i) => getTrangThaiTonKho(i.tonKhaDung, i.nguongCanhBao) === "HET_HANG",
    ).length,
    tonLauNgay: items.filter((i) => i.tonLauNgay).length,
  }
}

function patchItem(
  items: ITonKhoSanPham[],
  id: string,
  next: ITonKhoSanPham,
) {
  return items.map((i) => (i.id === id ? next : i))
}

type InventoryStore = {
  items: ITonKhoSanPham[]
  movements: ILichSuKho[]
  phieuNhap: IPhieuNhapKho[]
  phienKiem: IPhienKiemKho[]
}

let store: InventoryStore = {
  items: [...MOCK_TON_KHO],
  movements: [...MOCK_LICH_SU_KHO],
  phieuNhap: [...MOCK_PHIEU_NHAP],
  phienKiem: [...MOCK_PHIEN_KIEM],
}

const listeners = new Set<() => void>()

const getSnapshot = () => store

const setStore = (next: Partial<InventoryStore>) => {
  store = { ...store, ...next }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useInventory() {
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot)
  const { items, movements, phieuNhap, phienKiem } = snapshot
  const stats = React.useMemo(() => computeStats(items), [items])

  const applyChange = React.useCallback(
    (id: string, loai: LoaiBienDongKho, soLuong: number, ghiChu?: string) => {
      const current = store.items.find((i) => i.id === id)
      if (!current) return

      const qty =
        loai === LoaiBienDongKho.DIEU_CHINH && soLuong < 0
          ? soLuong
          : Math.abs(soLuong)

      if (!canApplyMovement(current, loai, qty)) return

      const result = createMovement(current, loai, qty, ghiChu)
      setStore({
        items: patchItem(store.items, id, result.item),
        movements: [result.movement, ...store.movements],
      })
    },
    [],
  )

  const adjustStock = React.useCallback(
    (id: string, form: AdjustStockForm) => {
      const loai =
        form.loai === "NHAP_KHO"
          ? LoaiBienDongKho.NHAP_KHO
          : LoaiBienDongKho.DIEU_CHINH
      const qty =
        form.loai === "DIEU_CHINH" && form.huong === "giam"
          ? -form.soLuong
          : form.soLuong
      applyChange(id, loai, qty, form.ghiChu)
    },
    [applyChange],
  )

  const importStock = React.useCallback((form: ImportStockForm) => {
    const maPhieu = `PN-${Date.now().toString().slice(-8)}`
    let nextItems = [...store.items]
    const newMovements: ILichSuKho[] = []
    const chiTiet = form.chiTiet.map((line, idx) => {
      const item = nextItems.find((i) => i.id === line.tonKhoId)!
      const { item: updated, movement } = createMovement(
        item,
        LoaiBienDongKho.NHAP_KHO,
        line.soLuong,
        form.ghiChu ?? `Phiếu nhập ${maPhieu}`,
      )
      nextItems = patchItem(nextItems, line.tonKhoId, updated)
      newMovements.push(movement)
      return {
        id: `ct-${idx}`,
        tonKhoId: line.tonKhoId,
        tenSanPham: item.tenSanPham,
        sku: item.sku,
        soLuong: line.soLuong,
      }
    })
    const newPhieu: IPhieuNhapKho = {
      id: `pn-${Date.now()}`,
      maPhieu,
      nhaCungCap: form.nhaCungCap,
      ngayNhap: new Date().toISOString().slice(0, 10),
      ghiChu: form.ghiChu,
      chiTiet,
      nguoiTao: "Nguyễn Minh Anh",
    }
    setStore({
      items: nextItems,
      movements: [...newMovements, ...store.movements],
      phieuNhap: [newPhieu, ...store.phieuNhap],
    })
    return newPhieu
  }, [])

  const stockCheck = React.useCallback(
    (form: StockCheckForm) => {
      const item = store.items.find((i) => i.id === form.tonKhoId)
      if (!item) return
      const chenhLech = form.thucTe - item.tonKhaDung
      if (chenhLech === 0) return
      const note = form.ghiChu
        ? `${form.ghiChu}${form.thang ? ` (Kỳ kiểm: ${form.thang})` : ""}`
        : `Kiểm kho${form.thang ? ` ${form.thang}` : ""}: hệ thống ${item.tonKhaDung}, thực tế ${form.thucTe}`
      applyChange(
        form.tonKhoId,
        LoaiBienDongKho.DIEU_CHINH,
        chenhLech,
        note,
      )
      setStore({
        phienKiem: [
          {
            id: `pk-${Date.now()}`,
            maPhien: `KK-${Date.now().toString().slice(-6)}`,
            tonKhoId: item.id,
            tenSanPham: item.tenSanPham,
            sku: item.sku,
            heThong: item.tonKhaDung,
            thucTe: form.thucTe,
            chenhLech,
            thoiGian: new Date().toISOString(),
            nguoiKiem: "Nguyễn Minh Anh",
          },
          ...store.phienKiem,
        ],
      })
    },
    [applyChange],
  )

  const updateThreshold = React.useCallback((id: string, nguong: number) => {
    setStore({
      items: store.items.map((i) =>
        i.id === id
          ? { ...i, nguongCanhBao: nguong, capNhatLuc: new Date().toISOString() }
          : i,
      ),
    })
  }, [])

  const deleteItem = React.useCallback((id: string) => {
    setStore({ items: store.items.filter((i) => i.id !== id) })
  }, [])

  const deleteMovement = React.useCallback((id: string) => {
    setStore({ movements: store.movements.filter((m) => m.id !== id) })
  }, [])

  const demoReserve = React.useCallback(
    (id: string, qty: number) =>
      applyChange(id, LoaiBienDongKho.GIU_HANG, qty, "Demo: giữ hàng checkout"),
    [applyChange],
  )

  const demoRelease = React.useCallback(
    (id: string, qty: number) =>
      applyChange(
        id,
        LoaiBienDongKho.TRA_GIU_HANG,
        qty,
        "Demo: trả giữ — thanh toán thất bại",
      ),
    [applyChange],
  )

  const demoSell = React.useCallback(
    (id: string, qty: number) =>
      applyChange(id, LoaiBienDongKho.BAN_HANG, qty, "Demo: hoàn tất đơn"),
    [applyChange],
  )

  const demoReturn = React.useCallback(
    (id: string, qty: number) => {
      const item = store.items.find((i) => i.id === id)
      if (!item || item.daBan < qty) return
      const nextItem: ITonKhoSanPham = {
        ...item,
        tonKhaDung: item.tonKhaDung + qty,
        daBan: item.daBan - qty,
        soLuongHoanTra: item.soLuongHoanTra + qty,
        capNhatLuc: new Date().toISOString(),
      }
      const movement: ILichSuKho = {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        thoiGian: nextItem.capNhatLuc,
        tonKhoId: item.id,
        tenSanPham: item.tenSanPham,
        sku: item.sku,
        loai: LoaiBienDongKho.DIEU_CHINH,
        soLuong: qty,
        truocThayDoi: item.tonKhaDung,
        sauThayDoi: nextItem.tonKhaDung,
        ghiChu: "Demo: trả hàng đã bán về tồn kho",
        nguoiThaoTac: "Nguyễn Minh Anh",
      }
      setStore({
        items: patchItem(store.items, id, nextItem),
        movements: [movement, ...store.movements],
      })
    },
    [],
  )

  const demoUnreturn = React.useCallback(
    (id: string, qty: number) => {
      const item = store.items.find((i) => i.id === id)
      if (!item || item.soLuongHoanTra < qty) return
      const nextItem: ITonKhoSanPham = {
        ...item,
        tonKhaDung: item.tonKhaDung - qty,
        daBan: item.daBan + qty,
        soLuongHoanTra: item.soLuongHoanTra - qty,
        capNhatLuc: new Date().toISOString(),
      }
      const movement: ILichSuKho = {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        thoiGian: nextItem.capNhatLuc,
        tonKhoId: item.id,
        tenSanPham: item.tenSanPham,
        sku: item.sku,
        loai: LoaiBienDongKho.DIEU_CHINH,
        soLuong: -qty,
        truocThayDoi: item.tonKhaDung,
        sauThayDoi: nextItem.tonKhaDung,
        ghiChu: "Demo: hủy hoàn trả hàng",
        nguoiThaoTac: "Nguyễn Minh Anh",
      }
      setStore({
        items: patchItem(store.items, id, nextItem),
        movements: [movement, ...store.movements],
      })
    },
    [],
  )

  const demoUnsell = React.useCallback(
    (id: string, qty: number) => {
      const item = store.items.find((i) => i.id === id)
      if (!item || item.daBan < qty) return
      const nextItem: ITonKhoSanPham = {
        ...item,
        daBan: Math.max(0, item.daBan - qty),
        dangGiu: item.dangGiu + qty,
        capNhatLuc: new Date().toISOString(),
      }
      const movement: ILichSuKho = {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        thoiGian: nextItem.capNhatLuc,
        tonKhoId: item.id,
        tenSanPham: item.tenSanPham,
        sku: item.sku,
        loai: LoaiBienDongKho.GIU_HANG,
        soLuong: qty,
        truocThayDoi: item.tonKhaDung,
        sauThayDoi: item.tonKhaDung,
        ghiChu: "Demo: hoàn giữ hàng từ đã bán",
        nguoiThaoTac: "Nguyễn Minh Anh",
      }
      setStore({
        items: patchItem(store.items, id, nextItem),
        movements: [movement, ...store.movements],
      })
    },
    [],
  )

  return {
    items,
    movements,
    phieuNhap,
    phienKiem,
    stats,
    adjustStock,
    importStock,
    stockCheck,
    updateThreshold,
    deleteItem,
    deleteMovement,
    demoReserve,
    demoRelease,
    demoSell,
    demoReturn,
    demoUnreturn,
    demoUnsell,
  }
}
