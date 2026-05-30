import { httpClient } from "./http";
import type { Category } from "@/features/products/types/category.type";

const normalizeCategory = (category: unknown): Category => ({
  id: String((category as Category).id),
  name: (category as Category).name,
  slug: (category as Category).slug,
  parentId:
    (category as Category).parentId === 0 ||
    (category as Category).parentId === "0" ||
    (category as Category).parentId === null
      ? "0"
      : String(
          (category as Category).parentId ||
            (category as { parent?: { id?: string } }).parent?.id ||
            "0",
        ),
  children:
    (category as Category).children?.map(normalizeCategory) ?? [],
  createdAt: (category as Category).createdAt,
  updatedAt: (category as Category).updatedAt,
});

export const getCategories = async (type: "tree" | "flat" = "tree") => {
  const res = await httpClient.get(`/categories?type=${type}`);
  const rawCategories = res.data?.data?.categories ?? [];
  return {
    categories: rawCategories.map(normalizeCategory),
  };
};

export const createCategory = async (payload: {
  name: string;
  parentId?: string;
}) => {
  const res = await httpClient.post("/categories", {
    name: payload.name,
    parentId: payload.parentId || "0",
  });
  return res.data;
};

export const updateCategory = async (
  id: string,
  payload: { name?: string; parentId?: string },
) => {
  const res = await httpClient.put(`/categories/${id}`, {
    ...payload,
    parentId: payload.parentId || "0",
  });
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await httpClient.delete(`/categories/${id}`);
  return res.data;
};
