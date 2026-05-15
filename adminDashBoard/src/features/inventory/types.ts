import type { PaginationMeta } from "@/features/user/types";

export interface InventoryRow {
  id: string;
  variantId: string;
  warehouseId?: string | null;
  available: number;
  reserved: number;
  sold: number;
  lowStockThreshold: number;
  lowStock: boolean;
}

export interface InventoryListResponse {
  items: InventoryRow[];
  meta: PaginationMeta;
}

export type MovementType = "IMPORT" | "RESERVE" | "RELEASE" | "SELL" | "ADJUST";

export interface Movement {
  id: string;
  variantId: string;
  warehouseId?: string | null;
  type: MovementType;
  quantity: number;
  referenceId?: string | null;
  referenceType?: string | null;
  createdBy?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface MovementsListResponse {
  items: Movement[];
  meta: PaginationMeta;
}
