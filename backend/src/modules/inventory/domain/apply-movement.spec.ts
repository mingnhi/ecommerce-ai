import { MovementType } from '../enums/movement-type.enum';
import { applyMovement } from './apply-movement';
import {
  InsufficientStockError,
  InvalidMovementError,
  StockSnapshot,
} from './stock-snapshot';

const snap = (
  available = 0,
  reserved = 0,
  sold = 0,
): StockSnapshot => ({ available, reserved, sold });

describe('applyMovement', () => {
  describe('IMPORT', () => {
    it('cộng vào available', () => {
      expect(
        applyMovement(snap(10, 2, 5), { type: MovementType.IMPORT, quantity: 7 }),
      ).toEqual(snap(17, 2, 5));
    });

    it('throw nếu quantity <= 0', () => {
      expect(() =>
        applyMovement(snap(), { type: MovementType.IMPORT, quantity: 0 }),
      ).toThrow(InvalidMovementError);
      expect(() =>
        applyMovement(snap(), { type: MovementType.IMPORT, quantity: -1 }),
      ).toThrow(InvalidMovementError);
    });
  });

  describe('RESERVE', () => {
    it('chuyển từ available → reserved', () => {
      expect(
        applyMovement(snap(10, 2, 5), { type: MovementType.RESERVE, quantity: 3 }),
      ).toEqual(snap(7, 5, 5));
    });

    it('throw InsufficientStockError nếu available không đủ', () => {
      expect(() =>
        applyMovement(snap(2), { type: MovementType.RESERVE, quantity: 5 }),
      ).toThrow(InsufficientStockError);
    });

    it('cho phép reserve chính xác bằng available', () => {
      expect(
        applyMovement(snap(5, 0, 0), { type: MovementType.RESERVE, quantity: 5 }),
      ).toEqual(snap(0, 5, 0));
    });
  });

  describe('RELEASE', () => {
    it('chuyển từ reserved → available', () => {
      expect(
        applyMovement(snap(7, 5, 5), { type: MovementType.RELEASE, quantity: 3 }),
      ).toEqual(snap(10, 2, 5));
    });

    it('throw nếu reserved không đủ', () => {
      expect(() =>
        applyMovement(snap(0, 1, 0), { type: MovementType.RELEASE, quantity: 5 }),
      ).toThrow(InsufficientStockError);
    });
  });

  describe('SELL', () => {
    it('chuyển từ reserved → sold', () => {
      expect(
        applyMovement(snap(10, 5, 2), { type: MovementType.SELL, quantity: 3 }),
      ).toEqual(snap(10, 2, 5));
    });

    it('throw nếu reserved không đủ', () => {
      expect(() =>
        applyMovement(snap(100, 0, 0), { type: MovementType.SELL, quantity: 1 }),
      ).toThrow(InsufficientStockError);
    });
  });

  describe('ADJUST', () => {
    it('set tuyệt đối available, giữ nguyên reserved/sold', () => {
      expect(
        applyMovement(snap(10, 5, 2), { type: MovementType.ADJUST, quantity: 50 }),
      ).toEqual(snap(50, 5, 2));
    });

    it('cho phép ADJUST = 0', () => {
      expect(
        applyMovement(snap(10, 5, 2), { type: MovementType.ADJUST, quantity: 0 }),
      ).toEqual(snap(0, 5, 2));
    });

    it('throw nếu ADJUST quantity âm', () => {
      expect(() =>
        applyMovement(snap(), { type: MovementType.ADJUST, quantity: -1 }),
      ).toThrow(InvalidMovementError);
    });
  });

  describe('Luồng end-to-end Order PENDING → PAID', () => {
    it('IMPORT 100 → RESERVE 3 → SELL 3', () => {
      let s = snap();
      s = applyMovement(s, { type: MovementType.IMPORT, quantity: 100 });
      expect(s).toEqual(snap(100, 0, 0));

      s = applyMovement(s, { type: MovementType.RESERVE, quantity: 3 });
      expect(s).toEqual(snap(97, 3, 0));

      s = applyMovement(s, { type: MovementType.SELL, quantity: 3 });
      expect(s).toEqual(snap(97, 0, 3));
    });

    it('IMPORT 10 → RESERVE 5 → RELEASE 5 (cancel order)', () => {
      let s = applyMovement(snap(), { type: MovementType.IMPORT, quantity: 10 });
      s = applyMovement(s, { type: MovementType.RESERVE, quantity: 5 });
      s = applyMovement(s, { type: MovementType.RELEASE, quantity: 5 });
      expect(s).toEqual(snap(10, 0, 0));
    });
  });

  describe('Concurrency edge cases', () => {
    it('2 user RESERVE variant cuối cùng — user thứ 2 phải fail', () => {
      let s = snap(1, 0, 0);
      s = applyMovement(s, { type: MovementType.RESERVE, quantity: 1 });
      expect(s).toEqual(snap(0, 1, 0));

      expect(() =>
        applyMovement(s, { type: MovementType.RESERVE, quantity: 1 }),
      ).toThrow(InsufficientStockError);
    });
  });
});
