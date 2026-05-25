import { PRODUCT_CATALOG } from "./mock-products";
import type { HomeCategory } from "@/types/catalog";

const BG_CLASSES = [
  "bg-sky-50",
  "bg-amber-50",
  "bg-violet-50",
  "bg-rose-50",
  "bg-emerald-50",
  "bg-orange-50",
  "bg-cyan-50",
  "bg-indigo-50",
];

export const HOME_CATEGORIES: HomeCategory[] = Array.from(
  PRODUCT_CATALOG.reduce((map, product) => {
    const existing = map.get(product.categoryId);
    if (existing) {
      existing.itemCount += 1;
      return map;
    }
    map.set(product.categoryId, {
      id: product.categoryId,
      name: product.category,
      slug: product.categoryId,
      image: product.image,
      itemCount: 1,
      bgClass: "",
    });
    return map;
  }, new Map<string, Omit<HomeCategory, "bgClass"> & { bgClass?: string }>()).values(),
).map((cat, index) => ({
  ...cat,
  bgClass: BG_CLASSES[index % BG_CLASSES.length],
}));

export const CATEGORY_TABS = [
  "Tất cả",
  ...HOME_CATEGORIES.map((c) => c.name),
];
