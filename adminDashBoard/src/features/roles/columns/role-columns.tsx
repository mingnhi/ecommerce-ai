import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Pencil, Trash2, Shield } from "lucide-react";
import type { Role } from "../types";
import { Can } from "@/shared/lib/casl";

type ColumnMeta = {
  onEdit?: (role: Role) => void;
  onManagePermissions?: (role: Role) => void;
};

export function buildRoleColumns(meta: ColumnMeta): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "name",
      header: "Tên vai trò",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
            {row.original.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "permissionCount",
      header: "Số quyền",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Shield className="size-3.5 text-sky-600" />
          <span className="text-sm font-medium">{row.original.permissionCount || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row, table }) => (
        <div className="flex items-center gap-1.5">
          <Can I="update" a="Role">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 hover:cursor-pointer"
              onClick={() => meta.onManagePermissions?.(row.original)}
            >
              <Shield className="size-4 text-sky-600" />
            </Button>
          </Can>
          <Can I="update" a="Role">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 hover:cursor-pointer"
              onClick={() => meta.onEdit?.(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          </Can>
          <Can I="delete" a="Role">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-destructive hover:text-destructive hover:cursor-pointer"
              onClick={() => {
                const tableMeta = table.options.meta as { onDeleteTarget?: (row: Role) => void };
                tableMeta?.onDeleteTarget?.(row.original);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];
}
