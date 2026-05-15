import { IOrder, IOrderListParams } from '@/types/order';
import { IPaginationResponse } from '@/types/common';

export type OrderListResponse = IPaginationResponse<IOrder[]>;

export type OrderListRequest = IOrderListParams;
