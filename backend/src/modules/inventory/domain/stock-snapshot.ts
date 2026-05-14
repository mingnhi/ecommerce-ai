export interface StockSnapshot {
  available: number;
  reserved: number;
  sold: number;
}

export class InsufficientStockError extends Error {
  constructor(
    public readonly variantId: string | undefined,
    public readonly requested: number,
    public readonly availableField: 'available' | 'reserved',
    public readonly current: number,
  ) {
    super(
      `Insufficient ${availableField}: requested ${requested}, current ${current}`,
    );
    this.name = 'InsufficientStockError';
  }
}

export class InvalidMovementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMovementError';
  }
}
