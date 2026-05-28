import { request } from "../axios";

import { KEYS } from "./keys";

import type {
  ProductListResponse,
  Product,
  QueryProductRequest,
} from "./types";

export const ProductService = {
  getAll: async (
    query: QueryProductRequest = {}
  ): Promise<ProductListResponse> => {
    return request.get<ProductListResponse>(
      KEYS.PRODUCTS,
      {
        params: query,
      }
    );
  },

  getBySlug: async (
    slug: string
  ): Promise<{ data: Product }> => {
    return request.get<{ data: Product }>(
      `${KEYS.PRODUCT_DETAIL}/${slug}`
    );
  },
};
