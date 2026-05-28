import { request } from '../axios';
import { KEYS } from './keys';
import type { ApiEnvelope } from '@/types/common';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  QueryCategoryRequest,
  CategoryTreeResponse,
  CategoryFlatResponse,
} from './types';

export const CategoryService = {
  getAll: async (query: QueryCategoryRequest = { type: 'tree' }) => {
    return request.get<ApiEnvelope<CategoryTreeResponse | CategoryFlatResponse>>(
      KEYS.CATEGORIES,
      { params: query }
    );
  },

  create: async (data: CreateCategoryRequest) => {
    return request.post<ApiEnvelope>(KEYS.CATEGORIES, data);
  },

  update: async (id: string, data: UpdateCategoryRequest) => {
    return request.put<ApiEnvelope>(`${KEYS.CATEGORY_DETAIL}/${id}`, data);
  },

  delete: async (id: string) => {
    return request.delete<ApiEnvelope>(`${KEYS.CATEGORY_DETAIL}/${id}`);
  },
};