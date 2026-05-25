import {
  ChevronRightIcon,
} from "lucide-react";

import type { Category } from "../types";

interface Props {
  categories: Category[];
}

const TreeItem = ({
  category,
  level = 0,
}: {
  category: Category;

  level?: number;
}) => {
  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3"
        style={{
          marginLeft:
            level * 20,
        }}
      >
        <ChevronRightIcon className="size-4 text-muted-foreground" />

        <span className="font-medium">
          {category.name}
        </span>
      </div>

      <div className="mt-2 space-y-2">
        {category.children?.map(
          child => (
            <TreeItem
              key={child.id}
              category={child}
              level={
                level + 1
              }
            />
          )
        )}
      </div>
    </div>
  );
};

export const CategoryTree = ({
  categories,
}: Props) => {
  return (
    <div className="space-y-3">
      {categories.map(
        category => (
          <TreeItem
            key={category.id}
            category={category}
          />
        )
      )}
    </div>
  );
};