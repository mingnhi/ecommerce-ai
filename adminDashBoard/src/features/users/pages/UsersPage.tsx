import { useMemo, useState, useCallback } from "react";
import { DataTableBase } from "@/shared/components/common/DataTableBase";
import { buildUserColumns } from "../columns/user-columns";
import { UserDialog } from "../components/UserDialog";
import { AssignRolesDialog } from "../components/AssignRolesDialog";
import { useUsers, useDeleteUser, useUpdateUserStatus } from "../hooks";
import type { User, UserStatus } from "../types";
import { PageSkeleton } from "@/shared/components/common/PageSkeleton";
import { useMe } from "@/features/auth/hooks";

export default function UsersPage() {
  const { data: currentUser } = useMe();
  const { data: users = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();

  const [editUser, setEditUser] = useState<User | null>(null);
  const [assignRolesUser, setAssignRolesUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(lower) ||
        user.fullName.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  const handleToggleStatus = useCallback(async (user: User, newStatus: UserStatus) => {
    if (user.id === currentUser?.id) return;
    await updateStatusMutation.mutateAsync({ id: user.id, status: newStatus });
  }, [updateStatusMutation, currentUser?.id]);

  const columns = useMemo(
    () =>
      buildUserColumns({
        currentUserId: currentUser?.id,
        onEdit: setEditUser,
        onToggleStatus: handleToggleStatus,
        onAssignRoles: setAssignRolesUser,
      }),
    [handleToggleStatus, currentUser?.id]
  );

  const toolbarConfig = useMemo(
    () => ({
      title: "Bộ lọc người dùng",
      description: "Danh sách và thông tin người dùng trong hệ thống",
      fields: [
        {
          type: "search" as const,
          placeholder: "Tìm kiếm email, tên...",
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
      title: "Xóa người dùng",
      getConfirmName: (user: User) => user.email,
      onConfirm: (user: User) => {
        if (user.id === currentUser?.id) return;
        void deleteMutation.mutateAsync(user.id);
      },
      confirmText: "Xóa",
      messageSuffix: "sẽ bị xóa khỏi hệ thống. Thao tác không hoàn tác.",
    }),
    [deleteMutation, currentUser?.id]
  );

  if (isLoading) return <PageSkeleton filterCount={1} columnCount={6} />;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:gap-3">

      <DataTableBase
        data={filteredData}
        columns={columns}
        filterKey={searchTerm}
        toolbarConfig={toolbarConfig}
        deleteConfig={deleteConfig}
      />

      <UserDialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
        user={editUser}
      />

      <AssignRolesDialog
        open={!!assignRolesUser}
        onOpenChange={(open) => !open && setAssignRolesUser(null)}
        user={assignRolesUser}
      />
    </div>
  );
}
