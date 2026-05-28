import type { ApiEnvelope } from '@/types/common';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryTreeResponse {
  categories: Category[];
}

export interface CategoryFlatResponse {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    createdAt: string;
    updatedAt?: string;
  }>;
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  parentId?: string;
}

export interface QueryCategoryRequest {
  type?: 'tree' | 'flat';
}