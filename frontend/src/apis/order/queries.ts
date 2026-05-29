import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage, getEnvelopeData } from '@/lib/api-response';
import { useAppSelector } from '@/stores';
import { selectIsAuthenticated } from '@/stores/auth/selectors';
import { KEYS as CART_KEYS } from '@/apis/cart/keys';
import { OrderService } from './requests';
import { orderKeys } from './keys';
import type {
  CreateOrderPayload,
  CreatedOrder,
  OrderListRequest,
  OrderListResult,
} from './types';

export const useOrderDetailQuery = (orderId: string, enabled = true) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const res = await OrderService.getById(orderId);
      return getEnvelopeData(res);
    },
    enabled: isAuthenticated && enabled && Boolean(orderId),
    refetchOnWindowFocus: false,
  });
};

export const useOrderListQuery = (params?: OrderListRequest) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return useQuery<OrderListResult>({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const res = await OrderService.list(params);
      const items = getEnvelopeData(res) ?? [];
      const pagination = res.meta?.pagination as OrderListResult['pagination'];

      return { items, pagination };
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatedOrder, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const res = await OrderService.create(payload);
      const data = getEnvelopeData(res);
      if (!data) {
        throw new Error('Không tạo được đơn hàng');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không tạo được đơn hàng'));
    },
  });
};
