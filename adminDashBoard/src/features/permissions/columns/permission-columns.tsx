import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Trash2, ChevronRight } from "lucide-react";
import type { Permission } from "../../roles/types";
import { Can } from "@/shared/components/common/Can";
import { PERMISSIONS } from "@/shared/lib/casl/permissions";
import { getActionMeta } from "@/shared/lib/casl/permission-actions";
import { getPermissionActionBadgeClass } from "@/shared/lib/casl/permission-badge";
import { cn } from "@/shared/lib/utils";

type PermissionRow = Permission & { isParent?: boolean };

export function buildPermissionColumns(): ColumnDef<PermissionRow>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        if (!row.original.isParent) {
          return <span className="inline-block w-6 shrink-0" aria-hidden />;
        }
        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-6 shrink-0 rounded-md p-0 text-slate-500 hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200",
                row.getIsExpanded() && "rotate-90"
              )}
            />
          </Button>
        );
      },
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Tên quyền",
      cell: ({ row }) => {
        if (row.original.isParent) {
          return (
            <span className="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-100">
              {row.original.name}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2 py-0.5 pl-4">
            <span className="font-mono text-slate-300 select-none dark:text-slate-700">├─</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {row.original.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "resource",
      header: "Module",
      cell: ({ row }) => {
        if (!row.original.isParent) return null;
        return (
          <Badge
            variant="outline"
            className="border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-700 dark:text-sky-300"
          >
            {row.original.resource}
          </Badge>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Hành động",
      cell: ({ row }) => {
        if (row.original.isParent) return null;
        const action = row.original.action;
        const meta = getActionMeta(action);
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wide",
              getPermissionActionBadgeClass(action)
            )}
          >
            {meta?.label ?? action}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <span
          className={cn(
            "line-clamp-2 text-sm leading-snug",
            row.original.isParent
              ? "italic text-slate-500 dark:text-slate-400"
              : "text-muted-foreground"
          )}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        if (row.original.isParent) return null;
        return (
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row, table }) => {
        if (row.original.isParent) return null;
        return (
          <Can permission={PERMISSIONS.PERMISSION.DELETE}>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 rounded-md p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer dark:hover:bg-rose-950/30"
              onClick={() => {
                const meta = table.options.meta as {
                  onDeleteTarget?: (row: Permission) => void;
                };
                meta?.onDeleteTarget?.(row.original);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Can>
        );
      },
    },
  ];
}
