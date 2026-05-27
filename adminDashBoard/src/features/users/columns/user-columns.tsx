import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Pencil, Trash2, UserX, UserCheck, Shield } from "lucide-react";
import type { User, UserStatus } from "../types";
import { Can } from "@/shared/components/common/Can";
import { PERMISSIONS } from "@/shared/lib/casl/permissions";

type ColumnMeta = {
  currentUserId?: string;
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User, status: UserStatus) => void;
  onAssignRoles?: (user: User) => void;
};

export function buildUserColumns(meta: ColumnMeta): ColumnDef<User>[] {
  return [
    {
      accessorKey: "fullName",
      header: "Họ và tên",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.fullName}</span>
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: "Vai trò",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.map((r) => (
            <Badge key={r.id} variant="secondary" className="text-xs">
              {r.name}
            </Badge>
          ))}
          {(!row.original.roles || row.original.roles.length === 0) && "—"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = {
          ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
          INACTIVE: "bg-slate-50 text-slate-700 border-slate-200",
          BANNED: "bg-red-50 text-red-700 border-red-200",
        };
        const labels = {
          ACTIVE: "Hoạt động",
          INACTIVE: "Không hoạt động",
          BANNED: "Đã khóa",
        };
        return (
          <Badge variant="outline" className={variants[status] || variants.INACTIVE}>
            {labels[status] || "Unknown"}
          </Badge>
        );
      },
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
      cell: ({ row, table }) => {
        const isSelf = !!meta.currentUserId && row.original.id === meta.currentUserId;
        const isBanned = row.original.status === "BANNED";
        const newStatus = isBanned ? "ACTIVE" : "BANNED";

        return (
          <div className="flex items-center gap-1.5">
            <Can permission={PERMISSIONS.USER.ASSIGN_ROLES}>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 hover:cursor-pointer text-sky-600 hover:text-sky-700"
                onClick={() => meta.onAssignRoles?.(row.original)}
                title="Phân quyền"
              >
                <Shield className="size-4" />
              </Button>
            </Can>
            {!isSelf && (
              <>
                <Can permission={PERMISSIONS.USER.UPDATE_STATUS}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`size-8 p-0 hover:cursor-pointer ${isBanned ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"}`}
                    onClick={() => meta.onToggleStatus?.(row.original, newStatus)}
                    title={isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                  >
                    {isBanned ? <UserCheck className="size-4" /> : <UserX className="size-4" />}
                  </Button>
                </Can>
                <Can permission={PERMISSIONS.USER.UPDATE}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 hover:cursor-pointer"
                    onClick={() => meta.onEdit?.(row.original)}
                    title="Chỉnh sửa"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </Can>
                <Can permission={PERMISSIONS.USER.DELETE}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 text-destructive hover:text-destructive hover:cursor-pointer"
                    title="Xóa"
                    onClick={() => {
                      const tableMeta = table.options.meta as { onDeleteTarget?: (row: User) => void };
                      tableMeta?.onDeleteTarget?.(row.original);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Can>
              </>
            )}
          </div>
        );
      },
    },
  ];
}
