import {
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";

import { ProductService } from "./requests";

import type {
  QueryProductRequest,
  ProductListResponse,
} from "./types";

import { KEYS } from "./keys";

export const useProducts = (
  query: QueryProductRequest = {}
) => {
  return useQuery<ProductListResponse>({
    queryKey: [KEYS.PRODUCTS, query],

    queryFn: () =>
      ProductService.getAll(query),

    placeholderData: keepPreviousData,

    staleTime: 1 * 60 * 1000,

    gcTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
  });
};