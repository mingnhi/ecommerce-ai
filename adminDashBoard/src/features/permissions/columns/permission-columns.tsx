import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import type { Permission } from "../../roles/types";
import { Can } from "@/shared/lib/casl";
import { cn } from "@/shared/lib/utils";

type ColumnMeta = {
  onEdit?: (permission: Permission) => void;
};

const actionColors: Record<string, string> = {
  read: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30",
  create: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
  update: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
  delete: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
  manage: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-900/30",
};

export function buildPermissionColumns(meta: ColumnMeta): ColumnDef<Permission>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const isParent = (row.original as any).isParent;
        if (!isParent) {
          return <span className="inline-block w-6 shrink-0" aria-hidden />;
        }
        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-6 p-0 text-slate-500 hover:bg-sky-500/10 hover:text-sky-500 hover:cursor-pointer rounded-md flex items-center justify-center transition-colors shrink-0"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Thu gọn" : "Mở rộng"}
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
        const isParent = (row.original as any).isParent;
        if (isParent) {
          return (
            <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-wide py-0.5">

              {row.original.name}
            </div>
          );
        }
        return (
          <div className="pl-4 flex items-center gap-2 text-slate-600 dark:text-slate-400 py-0.5">
            <span className="text-slate-300 dark:text-slate-700 select-none font-mono">├─</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.original.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "resource",
      header: "Tài nguyên",
      cell: ({ row }) => {
        const isParent = (row.original as any).isParent;
        if (isParent) {
          return (
            <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25 font-bold text-[10px]">
              {row.original.resource}
            </Badge>
          );
        }
        return null;
      },
    },
    {
      accessorKey: "action",
      header: "Hành động",
      cell: ({ row }) => {
        const isParent = (row.original as any).isParent;
        if (isParent) return null;
        const action = row.original.action;
        const colorClass = actionColors[action] || "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
        return (
          <Badge variant="outline" className={cn("text-[12px] font-semibold", colorClass)}>
            {action}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => {
        const isParent = (row.original as any).isParent;
        return (
          <span className={cn(
            "text-sm leading-normal",
            isParent
              ? "font-semibold text-slate-500 dark:text-slate-400 italic"
              : "text-muted-foreground/80"
          )}>
            {row.original.description}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        const isParent = (row.original as any).isParent;
        if (isParent) return null;
        return (
          <span className="text-sm text-muted-foreground/80 tabular-nums">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row, table }) => {
        const isParent = (row.original as any).isParent;
        if (isParent) return null;
        return (
          <div className="flex items-center gap-1">
            <Can I="delete" a="Permission">
              <Button
                variant="ghost"
                size="sm"
                className="size-7 hover:cursor-pointer p-0 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600"
                onClick={() => {
                  const tableMeta = table.options.meta as { onDeleteTarget?: (row: Permission) => void };
                  tableMeta?.onDeleteTarget?.(row.original);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </Can>
          </div>
        );
      },
    },
  ];
}
