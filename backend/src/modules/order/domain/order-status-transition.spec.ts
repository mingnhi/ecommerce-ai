import { OrderStatus } from '../enums/order-status.enum';
import {
  InvalidOrderTransitionError,
  OrderActor,
  canTransition,
  getNextStatuses,
  isTerminal,
  transitionOrderStatus,
} from './order-status-transition';

describe('OrderStatusTransition', () => {
  describe('isTerminal', () => {
    it.each([
      [OrderStatus.CANCELLED, true],
      [OrderStatus.REFUNDED, true],
      [OrderStatus.DELIVERED, false],
      [OrderStatus.PENDING, false],
      [OrderStatus.CONFIRMED, false],
      [OrderStatus.SHIPPED, false],
    ])('isTerminal(%s) = %s', (status, expected) => {
      expect(isTerminal(status)).toBe(expected);
    });
  });

  describe('getNextStatuses', () => {
    it('PENDING → [CONFIRMED, CANCELLED]', () => {
      expect(getNextStatuses(OrderStatus.PENDING).sort()).toEqual(
        [OrderStatus.CONFIRMED, OrderStatus.CANCELLED].sort(),
      );
    });

    it('PAID → [SHIPPED, CANCELLED, REFUNDED]', () => {
      expect(getNextStatuses(OrderStatus.CONFIRMED).sort()).toEqual(
        [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].sort(),
      );
    });

    it('COMPLETED → [REFUNDED] (cho phép post-delivery refund)', () => {
      expect(getNextStatuses(OrderStatus.DELIVERED)).toEqual([OrderStatus.REFUNDED]);
    });

    it('Terminal (CANCELLED/REFUNDED) → []', () => {
      expect(getNextStatuses(OrderStatus.CANCELLED)).toEqual([]);
      expect(getNextStatuses(OrderStatus.REFUNDED)).toEqual([]);
    });
  });

  describe('canTransition (không actor — chỉ check target hợp lệ)', () => {
    it.each([
      [OrderStatus.PENDING, OrderStatus.CONFIRMED, true],
      [OrderStatus.PENDING, OrderStatus.CANCELLED, true],
      [OrderStatus.PENDING, OrderStatus.SHIPPED, false],
      [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, true],
      [OrderStatus.CONFIRMED, OrderStatus.PENDING, false],
      [OrderStatus.SHIPPED, OrderStatus.DELIVERED, true],
      [OrderStatus.SHIPPED, OrderStatus.CONFIRMED, false],
      [OrderStatus.DELIVERED, OrderStatus.REFUNDED, true],
      [OrderStatus.DELIVERED, OrderStatus.PENDING, false],
      [OrderStatus.CANCELLED, OrderStatus.CONFIRMED, false],
      [OrderStatus.REFUNDED, OrderStatus.SHIPPED, false],
    ])('canTransition(%s → %s) = %s', (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });
  });

  describe('canTransition với actor', () => {
    it('PENDING → CONFIRMED chỉ SYSTEM được trigger', () => {
      expect(canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderActor.SYSTEM)).toBe(true);
      expect(canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderActor.ADMIN)).toBe(false);
      expect(canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderActor.USER)).toBe(false);
    });

    it('PENDING → CANCELLED — USER hoặc ADMIN', () => {
      expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED, OrderActor.USER)).toBe(true);
      expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED, OrderActor.ADMIN)).toBe(true);
      expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED, OrderActor.SYSTEM)).toBe(false);
    });

    it('CONFIRMED → CANCELLED chỉ ADMIN (user không được tự huỷ sau khi đã trả)', () => {
      expect(canTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderActor.ADMIN)).toBe(true);
      expect(canTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderActor.USER)).toBe(false);
    });
  });

  describe('transitionOrderStatus — happy path', () => {
    it('PENDING → CONFIRMED (SYSTEM)', () => {
      expect(
        transitionOrderStatus(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderActor.SYSTEM),
      ).toBe(OrderStatus.CONFIRMED);
    });

    it('chuỗi đầy đủ: PENDING → CONFIRMED → SHIPPED → DELIVERED', () => {
      let s: OrderStatus = OrderStatus.PENDING;
      s = transitionOrderStatus(s, OrderStatus.CONFIRMED, OrderActor.SYSTEM);
      s = transitionOrderStatus(s, OrderStatus.SHIPPED, OrderActor.ADMIN);
      s = transitionOrderStatus(s, OrderStatus.DELIVERED, OrderActor.ADMIN);
      expect(s).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('transitionOrderStatus — invalid', () => {
    it('throw InvalidOrderTransitionError với reason=invalid_target khi target không có trong rule', () => {
      try {
        transitionOrderStatus(OrderStatus.PENDING, OrderStatus.SHIPPED);
        fail('expected throw');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidOrderTransitionError);
        const err = e as InvalidOrderTransitionError;
        expect(err.reason).toBe('invalid_target');
        expect(err.from).toBe(OrderStatus.PENDING);
        expect(err.to).toBe(OrderStatus.SHIPPED);
      }
    });

    it('throw reason=forbidden_actor khi actor không có quyền', () => {
      try {
        transitionOrderStatus(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderActor.USER);
        fail('expected throw');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidOrderTransitionError);
        expect((e as InvalidOrderTransitionError).reason).toBe('forbidden_actor');
      }
    });

    it('không thể rollback: SHIPPED → PAID', () => {
      expect(() =>
        transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.CONFIRMED),
      ).toThrow(InvalidOrderTransitionError);
    });

    it('không thể đi từ terminal: CANCELLED → bất kỳ', () => {
      expect(() =>
        transitionOrderStatus(OrderStatus.CANCELLED, OrderStatus.CONFIRMED),
      ).toThrow(InvalidOrderTransitionError);
      expect(() =>
        transitionOrderStatus(OrderStatus.CANCELLED, OrderStatus.REFUNDED),
      ).toThrow(InvalidOrderTransitionError);
    });

    it('không thể self-transition: PENDING → PENDING', () => {
      expect(() =>
        transitionOrderStatus(OrderStatus.PENDING, OrderStatus.PENDING),
      ).toThrow(InvalidOrderTransitionError);
    });
  });

  describe('REFUND scenarios', () => {
    it('CONFIRMED → REFUNDED (admin huỷ trước khi ship)', () => {
      expect(
        transitionOrderStatus(OrderStatus.CONFIRMED, OrderStatus.REFUNDED, OrderActor.ADMIN),
      ).toBe(OrderStatus.REFUNDED);
    });

    it('SHIPPED → REFUNDED (return trong lúc giao)', () => {
      expect(
        transitionOrderStatus(OrderStatus.SHIPPED, OrderStatus.REFUNDED, OrderActor.ADMIN),
      ).toBe(OrderStatus.REFUNDED);
    });

    it('DELIVERED → REFUNDED (post-delivery refund)', () => {
      expect(
        transitionOrderStatus(OrderStatus.DELIVERED, OrderStatus.REFUNDED, OrderActor.ADMIN),
      ).toBe(OrderStatus.REFUNDED);
    });

    it('PENDING → REFUNDED không hợp lệ (chưa thu tiền lấy gì refund)', () => {
      expect(() =>
        transitionOrderStatus(OrderStatus.PENDING, OrderStatus.REFUNDED, OrderActor.ADMIN),
      ).toThrow(InvalidOrderTransitionError);
    });
  });
});
