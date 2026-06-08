export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
};

export type CategoriesTableRow =
  | {
      rowType: "parent";
      id: string;
      categoryId: string;
      name: string;
      slug: string;
      parentId: string;
      childCount: number;
      subRows: CategoriesTableRow[];
    }
  | ({
      rowType: "child";
    } & Category);
