import { MovementType } from '../enums/movement-type.enum';

export interface StockSnapshot {
  available: number;
  reserved: number;
  sold: number;
}

export interface MovementInput {
  type: MovementType;
  quantity: number;
  variantId: string;
}

export class InsufficientStockError extends Error {
  constructor(
    public readonly variantId: string,
    public readonly required: number,
    public readonly available: number,
  ) {
    super(
      `Tồn kho không đủ cho variant ${variantId}: cần ${required}, còn ${available}`,
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

export function applyMovement(
  current: StockSnapshot,
  input: MovementInput,
): StockSnapshot {
  if (!Number.isFinite(input.quantity)) {
    throw new InvalidMovementError(
      `quantity phải là số hợp lệ (variant ${input.variantId})`,
    );
  }

  switch (input.type) {
    case MovementType.IMPORT: {
      if (input.quantity <= 0) {
        throw new InvalidMovementError('IMPORT quantity phải > 0');
      }
      return { ...current, available: current.available + input.quantity };
    }
    case MovementType.RESERVE: {
      if (input.quantity <= 0) {
        throw new InvalidMovementError('RESERVE quantity phải > 0');
      }
      if (current.available < input.quantity) {
        throw new InsufficientStockError(
          input.variantId,
          input.quantity,
          current.available,
        );
      }
      return {
        ...current,
        available: current.available - input.quantity,
        reserved: current.reserved + input.quantity,
      };
    }
    case MovementType.RELEASE: {
      if (input.quantity <= 0) {
        throw new InvalidMovementError('RELEASE quantity phải > 0');
      }
      if (current.reserved < input.quantity) {
        throw new InvalidMovementError(
          `Không thể RELEASE ${input.quantity}: reserved chỉ có ${current.reserved}`,
        );
      }
      return {
        ...current,
        reserved: current.reserved - input.quantity,
        available: current.available + input.quantity,
      };
    }
    case MovementType.SELL: {
      if (input.quantity <= 0) {
        throw new InvalidMovementError('SELL quantity phải > 0');
      }
      if (current.reserved < input.quantity) {
        throw new InvalidMovementError(
          `Không thể SELL ${input.quantity}: reserved chỉ có ${current.reserved}`,
        );
      }
      return {
        ...current,
        reserved: current.reserved - input.quantity,
        sold: current.sold + input.quantity,
      };
    }
    case MovementType.ADJUST: {
      // ADJUST = set absolute available count.
      if (input.quantity < 0) {
        throw new InvalidMovementError('ADJUST quantity không được âm');
      }
      return { ...current, available: input.quantity };
    }
    default:
      throw new InvalidMovementError(
        `Movement type không hợp lệ: ${String(input.type)}`,
      );
  }
}
