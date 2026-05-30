import { httpClient } from "./http";
import type { Category } from "@/features/products/types/category.type";

type ApiCategory = Omit<Category, "parentId"> & {
  parentId?: string | number | null;
  parent?: { id?: string };
};

const normalizeCategory = (category: unknown): Category => {
  const raw = category as ApiCategory;

  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    parentId:
      raw.parentId === 0 ||
      raw.parentId === "0" ||
      raw.parentId == null
        ? "0"
        : String(raw.parentId || raw.parent?.id || "0"),
    children: raw.children?.map(normalizeCategory) ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

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
