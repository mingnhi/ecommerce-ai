import type { Category, CategoriesTableRow } from "../types/category.type";

export type CategoryListFilters = {
  search: string;
};

export function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];
  for (const category of categories) {
    result.push(category);
    if (category.children?.length) {
      result.push(...flattenCategories(category.children));
    }
  }
  return result;
}

export function filterCategoryTree(
  categories: Category[],
  filters: CategoryListFilters,
): Category[] {
  const q = filters.search.trim().toLowerCase();
  if (!q) return categories;

  return categories
    .map((parent) => {
      const parentMatch =
        parent.name.toLowerCase().includes(q) ||
        parent.slug.toLowerCase().includes(q);
      const children = (parent.children ?? []).filter(
        (child) =>
          child.name.toLowerCase().includes(q) ||
          child.slug.toLowerCase().includes(q),
      );

      if (parentMatch) return parent;
      if (children.length) return { ...parent, children };
      return null;
    })
    .filter((item): item is Category => item != null);
}

export function buildCategoryTableRows(
  categories: Category[],
): CategoriesTableRow[] {
  return categories.map((parent) => {
    const children = parent.children ?? [];
    return {
      rowType: "parent",
      id: `parent-${parent.id}`,
      categoryId: parent.id,
      name: parent.name,
      slug: parent.slug,
      parentId: parent.parentId,
      childCount: children.length,
      subRows: children.map((child) => ({
        rowType: "child",
        ...child,
      })),
    };
  });
}

export function getCategoryFromRow(row: CategoriesTableRow): Category {
  if (row.rowType === "child") return row;
  return {
    id: row.categoryId,
    name: row.name,
    slug: row.slug,
    parentId: row.parentId,
  };
}
