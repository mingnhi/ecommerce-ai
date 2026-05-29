import { useQuery } from '@tanstack/react-query';
import { CartService } from './requests';
import { KEYS } from './keys';
import { useAppSelector } from '@/stores';
import { selectIsAuthenticated } from '@/stores/auth/selectors';

type UseCartQueryOptions = {
  enabled?: boolean;
};

export const useCartQuery = (options: UseCartQueryOptions = {}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const enabled = options.enabled ?? isAuthenticated;

  return useQuery({
    queryKey: [KEYS.CART],
    queryFn: () => CartService.getCart(),
    enabled: isAuthenticated && enabled,
    refetchOnWindowFocus: false,
  });
};
