import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { buildRoleColumns } from "../columns/role-columns";
import { RoleDialog } from "../components/RoleDialog";
import { AssignPermissionsDialog } from "../components/AssignPermissionsDialog";
import { useRoles, useDeleteRole } from "../hooks";
import type { Role } from "../types";
import { PermissionButton } from "@/shared/components/common/PermissionButton";
import { PERMISSIONS } from "@/shared/lib/casl/permissions";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";

export default function RolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const deleteMutation = useDeleteRole();

  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [managePermissionsRole, setManagePermissionsRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return roles;
    const lower = searchTerm.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(lower) ||
        role.description.toLowerCase().includes(lower)
    );
  }, [roles, searchTerm]);

  const columns = useMemo(
    () =>
      buildRoleColumns({
        onEdit: setEditRole,
        onManagePermissions: setManagePermissionsRole,
      }),
    []
  );

  const toolbarConfig = useMemo(
    () => ({
      title: "Bộ lọc vai trò",
      description: "Danh sách các vai trò và phân quyền trong hệ thống",
      fields: [
        {
          type: "search" as const,
          placeholder: "Tìm vai trò...",
          value: searchTerm,
          onChange: setSearchTerm,
        },
      ],
      onReset: () => setSearchTerm(""),
    }),
    [searchTerm]
  );

  const deleteConfig = useMemo(
    () => ({
      title: "Xóa vai trò",
      getConfirmName: (role: Role) => role.name,
      onConfirm: (role: Role) => {
        void deleteMutation.mutateAsync(role.id);
      },
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa khỏi hệ thống. Thao tác không hoàn tác.",
    }),
    [deleteMutation]
  );

  if (isLoading) return <PageSkeleton filterCount={1} columnCount={5} />;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">
      <div className="flex items-center justify-end">
        <PermissionButton
          permission={PERMISSIONS.ROLE.CREATE}
          fallbackBehavior="alert"
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="rounded-sm bg-sky-600 hover:bg-sky-700 hover:cursor-pointer"
        >
          <Plus className="size-4 mr-1.5" />
          Tạo vai trò
        </PermissionButton>
      </div>

      <DataTableBase
        data={filteredData}
        columns={columns}
        filterKey={searchTerm}
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
      />

      <RoleDialog open={createOpen} onOpenChange={setCreateOpen} />

      <RoleDialog
        open={!!editRole}
        onOpenChange={(open) => !open && setEditRole(null)}
        role={editRole}
      />

      <AssignPermissionsDialog
        open={!!managePermissionsRole}
        onOpenChange={(open) => !open && setManagePermissionsRole(null)}
        role={managePermissionsRole}
      />
    </div>
  );
}
