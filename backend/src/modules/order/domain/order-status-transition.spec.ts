import { OrderStatus } from '../enums/order-status.enum';
import { OrderActor } from '../enums/order-actor.enum';
import {
  InvalidOrderTransitionError,
  transitionOrderStatus,
} from './order-status-transition';

describe('transitionOrderStatus', () => {
  describe('PENDING', () => {
    it('SYSTEM được PENDING → PAID', () => {
      expect(
        transitionOrderStatus(
          OrderStatus.PENDING,
          OrderStatus.PAID,
          OrderActor.SYSTEM,
        ),
      ).toBe(OrderStatus.PAID);
    });

    it('ADMIN/USER không được PENDING → PAID', () => {
      for (const actor of [OrderActor.ADMIN, OrderActor.USER]) {
        expect(() =>
          transitionOrderStatus(OrderStatus.PENDING, OrderStatus.PAID, actor),
        ).toThrow(InvalidOrderTransitionError);
      }
    });

    it('USER/ADMIN được PENDING → CANCELLED', () => {
      for (const actor of [OrderActor.USER, OrderActor.ADMIN]) {
        expect(
          transitionOrderStatus(
            OrderStatus.PENDING,
            OrderStatus.CANCELLED,
            actor,
          ),
        ).toBe(OrderStatus.CANCELLED);
      }
    });

    it('PENDING → SHIPPED bị reject (invalid_target)', () => {
      expect(() =>
        transitionOrderStatus(
          OrderStatus.PENDING,
          OrderStatus.SHIPPED,
          OrderActor.ADMIN,
        ),
      ).toThrow(InvalidOrderTransitionError);
    });
  });

  describe('PAID', () => {
    it('ADMIN được PAID → SHIPPED', () => {
      expect(
        transitionOrderStatus(
          OrderStatus.PAID,
          OrderStatus.SHIPPED,
          OrderActor.ADMIN,
        ),
      ).toBe(OrderStatus.SHIPPED);
    });

    it('USER không được PAID → CANCELLED (chỉ ADMIN)', () => {
      expect(() =>
        transitionOrderStatus(
          OrderStatus.PAID,
          OrderStatus.CANCELLED,
          OrderActor.USER,
        ),
      ).toThrow(InvalidOrderTransitionError);
    });

    it('ADMIN được PAID → CANCELLED', () => {
      expect(
        transitionOrderStatus(
          OrderStatus.PAID,
          OrderStatus.CANCELLED,
          OrderActor.ADMIN,
        ),
      ).toBe(OrderStatus.CANCELLED);
    });

    it('PAID → PENDING bị reject', () => {
      expect(() =>
        transitionOrderStatus(
          OrderStatus.PAID,
          OrderStatus.PENDING,
          OrderActor.ADMIN,
        ),
      ).toThrow(InvalidOrderTransitionError);
    });
  });

  describe('SHIPPED', () => {
    it('ADMIN/SYSTEM được SHIPPED → COMPLETED', () => {
      for (const actor of [OrderActor.ADMIN, OrderActor.SYSTEM]) {
        expect(
          transitionOrderStatus(
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED,
            actor,
          ),
        ).toBe(OrderStatus.COMPLETED);
      }
    });

    it('USER không được SHIPPED → *', () => {
      expect(() =>
        transitionOrderStatus(
          OrderStatus.SHIPPED,
          OrderStatus.COMPLETED,
          OrderActor.USER,
        ),
      ).toThrow(InvalidOrderTransitionError);
    });

    it('SHIPPED → PAID bị reject', () => {
      expect(() =>
        transitionOrderStatus(
          OrderStatus.SHIPPED,
          OrderStatus.PAID,
          OrderActor.ADMIN,
        ),
      ).toThrow(InvalidOrderTransitionError);
    });
  });

  describe('terminal states', () => {
    it('CANCELLED → * bị reject', () => {
      for (const to of [
        OrderStatus.PENDING,
        OrderStatus.PAID,
        OrderStatus.SHIPPED,
        OrderStatus.COMPLETED,
      ]) {
        expect(() =>
          transitionOrderStatus(OrderStatus.CANCELLED, to, OrderActor.ADMIN),
        ).toThrow(InvalidOrderTransitionError);
      }
    });

    it('COMPLETED → * bị reject', () => {
      for (const to of [
        OrderStatus.PENDING,
        OrderStatus.PAID,
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
      ]) {
        expect(() =>
          transitionOrderStatus(OrderStatus.COMPLETED, to, OrderActor.ADMIN),
        ).toThrow(InvalidOrderTransitionError);
      }
    });
  });

  describe('error fields', () => {
    it('invalid_target reason', () => {
      try {
        transitionOrderStatus(
          OrderStatus.PENDING,
          OrderStatus.SHIPPED,
          OrderActor.ADMIN,
        );
        throw new Error('expected to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidOrderTransitionError);
        expect((err as InvalidOrderTransitionError).reason).toBe(
          'invalid_target',
        );
      }
    });

    it('forbidden_actor reason', () => {
      try {
        transitionOrderStatus(
          OrderStatus.PENDING,
          OrderStatus.PAID,
          OrderActor.ADMIN,
        );
        throw new Error('expected to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(InvalidOrderTransitionError);
        expect((err as InvalidOrderTransitionError).reason).toBe(
          'forbidden_actor',
        );
      }
    });
  });
});
