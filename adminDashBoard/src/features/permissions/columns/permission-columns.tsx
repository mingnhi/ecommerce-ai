import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Trash2, ChevronRight } from "lucide-react";
import type { Permission } from "../../roles/types";
import { Can } from "@/shared/components/common/Can";
import { PERMISSIONS } from "@/shared/lib/casl/permissions";
import { getActionMeta } from "@/shared/lib/casl/permission-actions";
import { cn } from "@/shared/lib/utils";

type PermissionRow = Permission & { isParent?: boolean };

const ACTION_BADGE_CLASS: Record<string, string> = {
  read: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50",
  create: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  update: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
  delete: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
  manage: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
  import: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
  check: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50",
  adjust: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  update_threshold: "bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  update_status: "bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800/50",
  cancel: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
  assign_roles: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50",
  assign_permissions: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
};

const ACTION_BADGE_FALLBACK =
  "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700";

export function getPermissionActionBadgeClass(action: string): string {
  return ACTION_BADGE_CLASS[action] ?? ACTION_BADGE_FALLBACK;
}

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
