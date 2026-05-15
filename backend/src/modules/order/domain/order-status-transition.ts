import { OrderStatus, TERMINAL_STATUSES } from '../enums/order-status.enum';


export enum OrderActor {
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

interface TransitionRule {
  to: OrderStatus;
  allowedActors: ReadonlySet<OrderActor>;
}


const TRANSITIONS: Record<OrderStatus, ReadonlyArray<TransitionRule>> = {
  [OrderStatus.PENDING]: [
    { to: OrderStatus.CONFIRMED, allowedActors: new Set([OrderActor.SYSTEM]) },
    {
      to: OrderStatus.CANCELLED,
      allowedActors: new Set([OrderActor.USER, OrderActor.ADMIN]),
    },
  ],
  [OrderStatus.CONFIRMED]: [
    { to: OrderStatus.SHIPPED, allowedActors: new Set([OrderActor.ADMIN]) },
    { to: OrderStatus.CANCELLED, allowedActors: new Set([OrderActor.ADMIN]) },
    { to: OrderStatus.REFUNDED, allowedActors: new Set([OrderActor.ADMIN]) },
  ],
  [OrderStatus.SHIPPED]: [
    { to: OrderStatus.DELIVERED, allowedActors: new Set([OrderActor.ADMIN, OrderActor.SYSTEM]) },
    { to: OrderStatus.REFUNDED, allowedActors: new Set([OrderActor.ADMIN]) },
  ],
  [OrderStatus.DELIVERED]: [
    { to: OrderStatus.REFUNDED, allowedActors: new Set([OrderActor.ADMIN]) },
  ],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export class InvalidOrderTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
    public readonly actor?: OrderActor,
    public readonly reason: 'invalid_target' | 'forbidden_actor' = 'invalid_target',
  ) {
    super(
      reason === 'forbidden_actor'
        ? `Actor ${actor} không được phép chuyển ${from} → ${to}`
        : `Không thể chuyển ${from} → ${to}`,
    );
    this.name = 'InvalidOrderTransitionError';
  }
}

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function getNextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from].map((r) => r.to);
}

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor?: OrderActor,
): boolean {
  const rule = TRANSITIONS[from].find((r) => r.to === to);
  if (!rule) return false;
  if (actor === undefined) return true;
  return rule.allowedActors.has(actor);
}


export function transitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
  actor?: OrderActor,
): OrderStatus {
  const rule = TRANSITIONS[from].find((r) => r.to === to);
  if (!rule) {
    throw new InvalidOrderTransitionError(from, to, actor, 'invalid_target');
  }
  if (actor !== undefined && !rule.allowedActors.has(actor)) {
    throw new InvalidOrderTransitionError(from, to, actor, 'forbidden_actor');
  }
  return to;
}
