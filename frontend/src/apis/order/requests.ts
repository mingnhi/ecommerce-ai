import { request } from '@/apis/axios';
import { KEYS } from './keys';
import type { ApiEnvelope } from '@/types/common';
import type {
  ApiOrder,
  CreateOrderPayload,
  CreateOrderResponse,
  OrderListRequest,
  OrderListResponse,
} from './types';

export const OrderService = {
  list: (params?: OrderListRequest) =>
    request.get<OrderListResponse>(KEYS.ORDERS, { params }),

  getById: (orderId: string) =>
    request.get<ApiEnvelope<ApiOrder>>(`${KEYS.ORDERS}/${orderId}`),

  create: (data: CreateOrderPayload) =>
    request.post<CreateOrderResponse>(KEYS.ORDERS, data),
};
