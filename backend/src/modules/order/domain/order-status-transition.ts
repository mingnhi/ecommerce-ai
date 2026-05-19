import { OrderStatus } from '../enums/order-status.enum';
import { OrderActor } from '../enums/order-actor.enum';

export type InvalidTransitionReason = 'invalid_target' | 'forbidden_actor';

export class InvalidOrderTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
    public readonly actor: OrderActor,
    public readonly reason: InvalidTransitionReason,
  ) {
    super(
      reason === 'invalid_target'
        ? `Không thể chuyển ${from} → ${to}`
        : `Actor ${actor} không được phép chuyển ${from} → ${to}`,
    );
    this.name = 'InvalidOrderTransitionError';
  }
}

/**
 * ORDER state machine (aligned with DB_NTP enum):
 *   PENDING   → PAID         : SYSTEM only (payment webhook)
 *   PENDING   → CANCELLED    : USER / ADMIN
 *   PAID      → SHIPPED      : ADMIN
 *   PAID      → CANCELLED    : ADMIN only
 *   SHIPPED   → COMPLETED    : ADMIN / SYSTEM
 *   CANCELLED / COMPLETED → *: terminal
 */
const ALLOWED: Record<
  OrderStatus,
  Partial<Record<OrderStatus, OrderActor[]>>
> = {
  [OrderStatus.PENDING]: {
    [OrderStatus.PAID]: [OrderActor.SYSTEM],
    [OrderStatus.CANCELLED]: [OrderActor.USER, OrderActor.ADMIN],
  },
  [OrderStatus.PAID]: {
    [OrderStatus.SHIPPED]: [OrderActor.ADMIN],
    [OrderStatus.CANCELLED]: [OrderActor.ADMIN],
  },
  [OrderStatus.SHIPPED]: {
    [OrderStatus.COMPLETED]: [OrderActor.ADMIN, OrderActor.SYSTEM],
  },
  [OrderStatus.COMPLETED]: {},
  [OrderStatus.CANCELLED]: {},
};

export function transitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
  actor: OrderActor,
): OrderStatus {
  const allowedActors = ALLOWED[from]?.[to];
  if (!allowedActors) {
    throw new InvalidOrderTransitionError(from, to, actor, 'invalid_target');
  }
  if (!allowedActors.includes(actor)) {
    throw new InvalidOrderTransitionError(from, to, actor, 'forbidden_actor');
  }
  return to;
}
