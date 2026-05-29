import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CategoryService } from './requests';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  QueryCategoryRequest,
} from './types';
import { KEYS } from './keys';
import { getApiErrorMessage, isApiSuccess } from '@/lib/api-response';

export const useCategories = (query: QueryCategoryRequest = { type: 'tree' }) => {
  return useQuery({
    queryKey: [KEYS.CATEGORIES, query],
    queryFn: () => CategoryService.getAll(query),
    refetchOnWindowFocus: false,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => CategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.CATEGORIES] });
      toast.success('Tạo danh mục thành công');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Tạo danh mục thất bại'));
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      CategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.CATEGORIES] });
      toast.success('Cập nhật danh mục thành công');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Cập nhật danh mục thất bại'));
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEYS.CATEGORIES] });
      toast.success('Xóa danh mục thành công');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Xóa danh mục thất bại'));
    },
  });
};