import { request } from '@/apis/axios';
import { IAxiosResponse } from '@/types/common';
import { OrderListRequest, OrderListResponse } from './types';

export const getOrderListRequest = async (params?: OrderListRequest) => {
  return request.get<IAxiosResponse<OrderListResponse>>('/orders', { params });
};
