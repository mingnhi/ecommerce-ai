import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category";

const CATEGORIES_KEY = ["categories"] as const;

export function useCategories(type: "tree" | "flat" = "tree") {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, type],
    queryFn: () => getCategories(type),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; parentId?: string };
    }) => updateCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}
