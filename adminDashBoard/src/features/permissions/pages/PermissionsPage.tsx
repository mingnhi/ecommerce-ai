import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { buildPermissionColumns } from "../columns/permission-columns";
import { PermissionDialog, RESOURCE_NAMES_VI } from "../components/PermissionDialog";
import { usePermissions, useDeletePermission } from "../hooks";
import type { Permission } from "../../roles/types";
import { Can } from "@/shared/lib/casl";
import { cn } from "@/shared/lib/utils";

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
          p.action.toLowerCase().includes(lower)
      );
    }

    if (resourceFilter && resourceFilter !== "all") {
      result = result.filter((p) => p.resource === resourceFilter);
    }

    // Now group by resource to create the nested subRows hierarchy
    const uniqueResources = Array.from(new Set(result.map((p) => p.resource)));
    const finalRows: any[] = [];

    uniqueResources.forEach((res) => {
      const children = result.filter((p) => p.resource === res);
      if (children.length > 0) {
        // Add parent module header row with children as subRows
        finalRows.push({
          id: `parent-${res}`,
          name: RESOURCE_NAMES_VI[res] || res,
          resource: res,
          action: "", // empty action
          description: `Quản lý các chức năng thuộc module ${RESOURCE_NAMES_VI[res]?.toLowerCase() || res.toLowerCase()}`,
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
      ...unique.map((r) => ({ value: r, label: RESOURCE_NAMES_VI[r] || r })),
    ];
  }, [permissions]);

  const columns = useMemo(
    () =>
      buildPermissionColumns({}),
    []
  );

  const toolbarConfig = useMemo(
    () => ({
      title: "Quản lý quyền hạn",
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
    [searchTerm, resourceFilter, resourceOptions]
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
    [deleteMutation]
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Quản lý quyền hạn</h1>
            <p className="text-sm text-muted-foreground">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý quyền hạn</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các quyền hạn trong hệ thống
          </p>
        </div>
        <Can I="create" a="Permission">
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="rounded-sm bg-sky-600 hover:bg-sky-700 hover:cursor-pointer"
          >
            <Plus className="size-4 mr-1.5" />
            Tạo quyền hạn
          </Button>
        </Can>
      </div>

      <DataTableBase
        data={filteredData}
        columns={columns}
        filterKey={searchTerm + resourceFilter}
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
        getSubRows={(row: any) => (row.isParent ? row.subRows : undefined)}
        mainColumnId="name"
        defaultExpandedAll={true}
        rowClassName={(row) =>
          cn(
            "border-slate-100 dark:border-slate-900 transition-colors",
            row.original.isParent
              ? "bg-slate-50/70 dark:bg-slate-900/40 font-bold hover:bg-slate-50/70 dark:hover:bg-slate-900/40 border-l-2"
              : "hover:bg-slate-50/20 dark:hover:bg-slate-900/10"
          )
        }
      />

      <PermissionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
