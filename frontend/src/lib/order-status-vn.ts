import type { OrderStatus, OrderTimelineEntry } from '@/apis/orders';

export const ORDER_STATUS_VN: Record<OrderStatus, { label: string; description: string; color: string }> = {
    PENDING: {
        label: 'Chờ xử lý',
        description: 'Đơn đang chờ xác nhận thanh toán',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    PAID: {
        label: 'Đã thanh toán',
        description: 'Đơn đã được thanh toán, chờ đóng gói',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    SHIPPED: {
        label: 'Đang giao',
        description: 'Đơn đang trên đường tới bạn',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    COMPLETED: {
        label: 'Hoàn tất',
        description: 'Đơn đã giao thành công',
        color: 'bg-green-100 text-green-800 border-green-200',
    },
    CANCELLED: {
        label: 'Đã huỷ',
        description: 'Đơn đã bị huỷ',
        color: 'bg-red-100 text-red-800 border-red-200',
    },
    REFUNDED: {
        label: 'Đã hoàn tiền',
        description: 'Đơn đã được hoàn tiền',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
    },
};

const ACTOR_VN: Record<OrderTimelineEntry['actor'], string> = {
    USER: 'Bạn',
    ADMIN: 'Cửa hàng',
    SYSTEM: 'Hệ thống',
};

/**
 * Format 1 timeline entry sang câu tiếng Việt tự nhiên.
 * VD: SYSTEM PENDING→PAID → "Hệ thống xác nhận thanh toán"
 *     USER PENDING→CANCELLED → "Bạn đã huỷ đơn"
 *     ADMIN PAID→SHIPPED → "Cửa hàng giao hàng"
 */
export function formatTimelineEntry(entry: OrderTimelineEntry): string {
    const actor = ACTOR_VN[entry.actor] ?? entry.actor;
    const toLabel = ORDER_STATUS_VN[entry.toStatus]?.label ?? entry.toStatus;

    // Format đặc biệt cho transition phổ biến
    if (!entry.fromStatus) {
        return `${actor} tạo đơn (${toLabel})`;
    }

    if (entry.fromStatus === 'PENDING' && entry.toStatus === 'PAID') {
        return `${actor} xác nhận thanh toán`;
    }
    if (entry.fromStatus === 'PAID' && entry.toStatus === 'SHIPPED') {
        return `${actor} bàn giao hàng cho đơn vị vận chuyển`;
    }
    if (entry.fromStatus === 'SHIPPED' && entry.toStatus === 'COMPLETED') {
        return `${actor} xác nhận giao thành công`;
    }
    if (entry.toStatus === 'CANCELLED') {
        return `${actor} đã huỷ đơn`;
    }
    if (entry.toStatus === 'REFUNDED') {
        return `${actor} đã hoàn tiền`;
    }

    const fromLabel = ORDER_STATUS_VN[entry.fromStatus]?.label ?? entry.fromStatus;
    return `${actor}: ${fromLabel} → ${toLabel}`;
}

export function getOrderStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_VN[status]?.label ?? status;
}

export function getOrderStatusColor(status: OrderStatus): string {
    return ORDER_STATUS_VN[status]?.color ?? 'bg-gray-100 text-gray-700';
}
