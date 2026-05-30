import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ProductService } from './requests';
import { KEYS } from './keys';
import type {
  ProductListResponse,
  ProductPriceRangeResponse,
  QueryProductRequest,
} from './types';

export const useProductPriceRange = () => {
  return useQuery<ProductPriceRangeResponse>({
    queryKey: [KEYS.PRICE_RANGE],
    queryFn: () => ProductService.getPriceRange(),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
};

export const useProducts = (query: QueryProductRequest = {}) => {
  return useQuery<ProductListResponse>({
    queryKey: [KEYS.PRODUCTS, query],
    queryFn: () => ProductService.getAll(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: [KEYS.PRODUCT_DETAIL, slug],
    queryFn: () => ProductService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });
};
