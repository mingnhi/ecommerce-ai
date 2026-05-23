type InventoryResponse = {
  id: string;
  variantId: string;
  available: number;
  reserved: number;
  sold: number;
  updatedAt: Date;
};

type MovementResponse = {
  id: string;
  variantId: string;
  type: string;
  quantity: number;
  referenceId?: string;
  note?: string;
  createdAt: Date;
};

type ApplyMovementResponse = {
  inventory: InventoryResponse;
  movement: MovementResponse;
};
