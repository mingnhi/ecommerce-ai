import { EyeIcon, PencilIcon, Trash2Icon, ImageIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { ProductListItem } from "../types/product.type";

interface Props {
  products: ProductListItem[];
  onView: (slug: string) => void;
  onEdit: (product: ProductListItem) => void;
  onDelete: (id: string) => void;
}

export const ProductTable = ({
  products,
  onView,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted">
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th className="text-right">Price</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td>
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    className="h-14 w-14 object-cover rounded"
                  />
                ) : (
                  <ImageIcon />
                )}
              </td>

              <td>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">
                  {p.shortDescription}
                </div>
              </td>

              <td>{p.category?.name}</td>

              <td className="text-right">
                {p.price?.price ?? p.price?.originalPrice ?? 0}
              </td>

              <td>
                <Badge>{p.isActive ? "Active" : "Hidden"}</Badge>
              </td>

              <td className="text-right flex gap-2 justify-end">
                <Button onClick={() => onView(p.slug)}>
                  <EyeIcon />
                </Button>
                <Button onClick={() => onEdit(p)}>
                  <PencilIcon />
                </Button>
                <Button onClick={() => onDelete(p.id)}>
                  <Trash2Icon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};