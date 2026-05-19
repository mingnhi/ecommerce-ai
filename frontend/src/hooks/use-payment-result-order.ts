import { useEffect, useState } from "react";
import { MOCK_ORDERS } from "@/faker/mock-orders";
import type { IOrder, OrderStatus } from "@/types/order";

const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "shipping", "cancelled", "returned"];

export function usePaymentResultOrder(orderId: string) {
  const [order, setOrder] = useState<IOrder | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    const tick = () => {
      if (!active) return;

      const found = MOCK_ORDERS.find(
        (o) => o.id === orderId || o.orderNumber === orderId,
      );

      if (found) {
        setOrder(found);
        if (TERMINAL_STATUSES.includes(found.status)) {
          setPolling(false);
          return;
        }
      }

      timer = setTimeout(tick, 3000);
    };

    tick();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  return { order, polling };
}
