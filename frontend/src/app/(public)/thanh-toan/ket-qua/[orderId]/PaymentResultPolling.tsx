'use client';

import { useEffect, useState } from 'react';
import { ordersApi, type CustomerOrder } from '@/apis/orders';
import { paymentsApi, type Payment } from '@/apis/payments';

interface PaymentResultPollingProps {
  orderId: string;
  initialOrder: CustomerOrder;
  initialPayment: Payment | null;
  children: (data: { order: CustomerOrder; payment: Payment | null; polling: boolean }) => React.ReactNode;
}

export function PaymentResultPolling({ orderId, initialOrder, initialPayment, children }: PaymentResultPollingProps) {
  const [order, setOrder] = useState<CustomerOrder>(initialOrder);
  const [payment, setPayment] = useState<Payment | null>(initialPayment);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    const tick = async () => {
      try {
        const [o, p] = await Promise.all([
          ordersApi.getById(orderId),
          paymentsApi.getByOrder(orderId).catch(() => null),
        ]);
        if (!active) return;

        setOrder(o);
        setPayment(p);

        if (['PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status) ||
            p?.status === 'COMPLETED' || p?.status === 'FAILED') {
          setPolling(false);
          return;
        }
        timer = setTimeout(tick, 3000);
      } catch {
        if (!active) return;
        timer = setTimeout(tick, 5000);
      }
    };

    // Chỉ bắt đầu poll nếu trạng thái hiện tại là PENDING
    if (order.status === 'PENDING') {
      tick();
    } else {
      setPolling(false);
    }

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, order.status]);

  return <>{children({ order, payment, polling })}</>;
}
