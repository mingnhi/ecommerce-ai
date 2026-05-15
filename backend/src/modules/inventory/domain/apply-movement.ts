import { MovementType } from '../enums/movement-type.enum';
import {
  InsufficientStockError,
  InvalidMovementError,
  StockSnapshot,
} from './stock-snapshot';

export interface ApplyMovementInput {
  type: MovementType;
  quantity: number;
  variantId?: string;
}

export function applyMovement(
  current: StockSnapshot,
  movement: ApplyMovementInput,
): StockSnapshot {
  const { type, quantity, variantId } = movement;

  if (type === MovementType.ADJUST) {
    if (quantity < 0) {
      throw new InvalidMovementError('ADJUST quantity must be >= 0');
    }
    return { ...current, available: quantity };
  }

  if (quantity <= 0) {
    throw new InvalidMovementError(`${type} quantity must be > 0`);
  }

  switch (type) {
    case MovementType.IMPORT:
      return { ...current, available: current.available + quantity };

    case MovementType.RESERVE:
      if (current.available < quantity) {
        throw new InsufficientStockError(
          variantId,
          quantity,
          'available',
          current.available,
        );
      }
      return {
        ...current,
        available: current.available - quantity,
        reserved: current.reserved + quantity,
      };

    case MovementType.RELEASE:
      if (current.reserved < quantity) {
        throw new InsufficientStockError(
          variantId,
          quantity,
          'reserved',
          current.reserved,
        );
      }
      return {
        ...current,
        reserved: current.reserved - quantity,
        available: current.available + quantity,
      };

    case MovementType.SELL:
      if (current.reserved < quantity) {
        throw new InsufficientStockError(
          variantId,
          quantity,
          'reserved',
          current.reserved,
        );
      }
      return {
        ...current,
        reserved: current.reserved - quantity,
        sold: current.sold + quantity,
      };

    case MovementType.RETURN:
      return {
        ...current,
        available: current.available + quantity,
        sold: current.sold - quantity,
      };

    default:
      throw new InvalidMovementError(`Unknown movement type: ${type}`);
  }
}
