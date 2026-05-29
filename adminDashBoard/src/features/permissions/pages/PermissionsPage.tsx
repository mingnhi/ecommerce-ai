import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { buildPermissionColumns } from "../columns/permission-columns";
import { PermissionDialog } from "../components/PermissionDialog";
import { usePermissions, useDeletePermission } from "../hooks";
import type { Permission } from "../../roles/types";
import { PERMISSIONS } from "@/shared/lib/casl/permissions";
import { getResourceLabel } from "@/shared/lib/casl/permission-actions";
import { cn } from "@/shared/lib/utils";
import { PermissionButton } from "@/shared/components/common/PermissionButton";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";

export default function PermissionsPage() {
  const { data: permissions = [], isLoading } = usePermissions();
  const deleteMutation = useDeletePermission();

  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const filteredData = useMemo(() => {
    let result = permissions;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.action.toLowerCase().includes(lower),
      );
    }

    if (resourceFilter && resourceFilter !== "all") {
      result = result.filter((p) => p.resource === resourceFilter);
    }

    // Now group by resource to create the nested subRows hierarchy
    const uniqueResources = Array.from(new Set(result.map((p) => p.resource)));
    const finalRows: unknown[] = [];

    uniqueResources.forEach((res) => {
      const children = result.filter((p) => p.resource === res);
      if (children.length > 0) {
        // Add parent module header row with children as subRows
        finalRows.push({
          id: `parent-${res}`,
          name: getResourceLabel(res),
          resource: res,
          action: "",
          description: `Quản lý các chức năng thuộc module ${getResourceLabel(res).toLowerCase()}`,
          createdAt: children[0]?.createdAt || new Date().toISOString(),
          isParent: true,
          subRows: children.map((child) => ({
            ...child,
            isParent: false,
          })),
        });
      }
    });

    return finalRows;
  }, [permissions, searchTerm, resourceFilter]);

  const resourceOptions = useMemo(() => {
    const unique = Array.from(new Set(permissions.map((p) => p.resource)));
    return [
      { value: "all", label: "Tất cả" },
      ...unique.map((r) => ({ value: r, label: getResourceLabel(r) })),
    ];
  }, [permissions]);

  const columns = useMemo(() => buildPermissionColumns(), []);

  const toolbarConfig = useMemo(
    () => ({
      title: "Bộ lọc quyền hạn",
      description: "Danh sách các quyền hạn trong hệ thống",
      fields: [
        {
          type: "search" as const,
          placeholder: "Tìm quyền...",
          value: searchTerm,
          onChange: setSearchTerm,
        },
        {
          type: "select" as const,
          placeholder: "Lọc theo resource",
          value: resourceFilter || "all",
          onChange: (v: string) => setResourceFilter(v === "all" ? "" : v),
          options: resourceOptions,
        },
      ],
      onReset: () => {
        setSearchTerm("");
        setResourceFilter("");
      },
    }),
    [searchTerm, resourceFilter, resourceOptions],
  );

  const deleteConfig = useMemo(
    () => ({
      title: "Xóa quyền hạn",
      getConfirmName: (permission: Permission) => permission.name,
      onConfirm: (permission: Permission) => {
        void deleteMutation.mutateAsync(permission.id);
      },
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa khỏi hệ thống. Thao tác không hoàn tác.",
    }),
    [deleteMutation],
  );

  if (isLoading) return <PageSkeleton filterCount={2} columnCount={4} />;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <div className="flex items-center justify-end">
        <PermissionButton
          permission={PERMISSIONS.PERMISSION.CREATE}
          fallbackBehavior="alert"
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="rounded-sm bg-sky-600 hover:bg-sky-700 hover:cursor-pointer"
        >
          <Plus className="size-4 mr-1.5" />
          Tạo quyền hạn
        </PermissionButton>
      </div>

      <DataTableBase
        data={filteredData}
        columns={columns}
        filterKey={searchTerm + resourceFilter}
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
        getSubRows={(row: unknown) => (row.isParent ? row.subRows : undefined)}
        mainColumnId="name"
        defaultExpandedAll={true}
        rowClassName={(row) => {
          const original = row.original as Permission & { isParent?: boolean };
          return cn(
            "border-slate-100 dark:border-slate-900 transition-colors",
            original.isParent
              ? "bg-slate-50/70 dark:bg-slate-900/40 font-bold hover:bg-slate-50/70 dark:hover:bg-slate-900/40 border-l-2"
              : "hover:bg-slate-50/20 dark:hover:bg-slate-900/10",
          );
        }}
      />

      <PermissionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
