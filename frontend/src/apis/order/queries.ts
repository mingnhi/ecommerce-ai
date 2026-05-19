import { useQuery } from '@tanstack/react-query';
import { orderKeys } from './keys';
import { getOrderListRequest } from './requests';
import { OrderListRequest } from './types';

export const useOrderListQuery = (params?: OrderListRequest) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrderListRequest(params),
    select: (data) => data.data,
  });
};
