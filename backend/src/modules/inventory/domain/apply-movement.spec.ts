import { MovementType } from '../enums/movement-type.enum';
import {
  InsufficientStockError,
  InvalidMovementError,
  StockSnapshot,
  applyMovement,
} from './apply-movement';

describe('applyMovement', () => {
  const empty: StockSnapshot = { available: 10, reserved: 0, sold: 0 };
  const withReserved: StockSnapshot = { available: 5, reserved: 3, sold: 0 };
  const v = 'v1';

  it('IMPORT cộng vào available', () => {
    expect(
      applyMovement(empty, { type: MovementType.IMPORT, quantity: 5, variantId: v }),
    ).toEqual({ available: 15, reserved: 0, sold: 0 });
  });

  it('RESERVE chuyển available → reserved', () => {
    expect(
      applyMovement(empty, { type: MovementType.RESERVE, quantity: 3, variantId: v }),
    ).toEqual({ available: 7, reserved: 3, sold: 0 });
  });

  it('RESERVE > available throw InsufficientStockError', () => {
    expect(() =>
      applyMovement(empty, { type: MovementType.RESERVE, quantity: 99, variantId: v }),
    ).toThrow(InsufficientStockError);
  });

  it('RELEASE chuyển reserved → available', () => {
    expect(
      applyMovement(withReserved, {
        type: MovementType.RELEASE,
        quantity: 2,
        variantId: v,
      }),
    ).toEqual({ available: 7, reserved: 1, sold: 0 });
  });

  it('RELEASE > reserved throw InvalidMovementError', () => {
    expect(() =>
      applyMovement(withReserved, {
        type: MovementType.RELEASE,
        quantity: 99,
        variantId: v,
      }),
    ).toThrow(InvalidMovementError);
  });

  it('SELL chuyển reserved → sold', () => {
    expect(
      applyMovement(withReserved, { type: MovementType.SELL, quantity: 2, variantId: v }),
    ).toEqual({ available: 5, reserved: 1, sold: 2 });
  });

  it('SELL > reserved throw InvalidMovementError', () => {
    expect(() =>
      applyMovement(withReserved, {
        type: MovementType.SELL,
        quantity: 99,
        variantId: v,
      }),
    ).toThrow(InvalidMovementError);
  });

  it('ADJUST set absolute available', () => {
    expect(
      applyMovement(empty, { type: MovementType.ADJUST, quantity: 100, variantId: v }),
    ).toEqual({ available: 100, reserved: 0, sold: 0 });
  });

  it('ADJUST 0 → available = 0', () => {
    expect(
      applyMovement(empty, { type: MovementType.ADJUST, quantity: 0, variantId: v }),
    ).toEqual({ available: 0, reserved: 0, sold: 0 });
  });

  it('ADJUST âm throw', () => {
    expect(() =>
      applyMovement(empty, { type: MovementType.ADJUST, quantity: -1, variantId: v }),
    ).toThrow(InvalidMovementError);
  });

  it('quantity <= 0 cho non-ADJUST throw', () => {
    for (const type of [
      MovementType.IMPORT,
      MovementType.RESERVE,
      MovementType.RELEASE,
      MovementType.SELL,
    ]) {
      expect(() => applyMovement(empty, { type, quantity: 0, variantId: v })).toThrow(
        InvalidMovementError,
      );
      expect(() => applyMovement(empty, { type, quantity: -5, variantId: v })).toThrow(
        InvalidMovementError,
      );
    }
  });
});
