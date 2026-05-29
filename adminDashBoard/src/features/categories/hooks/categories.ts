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

export const useCategories = (
  type:
    | "tree"
    | "flat" = "tree"
) => {
  return useQuery({
    queryKey: [
      "categories",
      type,
    ],

    queryFn: () =>
      getCategories(type),
  });
};

export const useCreateCategory =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createCategory,

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "categories",
            ],
          }
        );
      },
    });
  };

export const useUpdateCategory =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: ({
        id,
        payload,
      }: unknown) =>
        updateCategory(
          id,
          payload
        ),

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "categories",
            ],
          }
        );
      },
    });
  };

export const useDeleteCategory =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        deleteCategory,

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "categories",
            ],
          }
        );
      },
    });
  };