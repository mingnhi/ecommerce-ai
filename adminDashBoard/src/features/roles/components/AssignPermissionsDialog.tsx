import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Shield, Search, ChevronDown } from "lucide-react";
import {
  useAvailablePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from "../hooks";
import type { Role, Permission } from "../types";
import { cn } from "@/shared/lib/utils";
import { getActionMeta } from "@/shared/lib/casl/permission-actions";
import { getPermissionActionBadgeClass } from "@/shared/lib/casl/permission-badge";

const RESOURCE_LABELS: Record<string, string> = {
  Dashboard: "Tổng quan (Dashboard)",
  Product: "Sản phẩm (Product)",
  Order: "Đơn hàng (Order)",
  Inventory: "Tồn kho (Inventory)",
  User: "Người dùng (User)",
  Role: "Vai trò (Role)",
  Permission: "Quyền hạn (Permission)",
  all: "Tất cả (all)",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
};

export function AssignPermissionsDialog({ open, onOpenChange, role }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const { data: availablePermissions = [] } = useAvailablePermissions();
  const { data: currentPermissions = [] } = useRolePermissions(role?.id || "");

  const updatePermissionsMutation = useUpdateRolePermissions();

  const currentIds = useMemo(() => currentPermissions.map((p) => p.id), [currentPermissions]);

  // Synchronize initial selection state when dialog opens or role permissions change
  useEffect(() => {
    if (open) {
      setSelectedIds(currentIds);
      setSearchQuery("");
      setCollapsedModules({});
    }
  }, [open, currentIds]);

  const toggleCollapseModule = (resource: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [resource]: !prev[resource],
    }));
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleModule = (modulePerms: Permission[], isAllSelected: boolean) => {
    const permIds = modulePerms.map((p) => p.id);
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !permIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const next = [...prev];
        permIds.forEach((id) => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (!role) return;

    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: selectedIds,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = updatePermissionsMutation.isPending;

  // Filter available permissions based on search query
  const filteredPermissions = useMemo(() => {
    return availablePermissions.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q)
      );
    });
  }, [availablePermissions, searchQuery]);

  // Group by module/resource
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
      const res = p.resource || "Khác";
      if (!acc[res]) acc[res] = [];
      acc[res].push(p);
      return acc;
    }, {});
  }, [filteredPermissions]);

  // Calculate dynamic diff stats
  const diffStats = useMemo(() => {
    const initialSet = new Set(currentIds);
    const selectedSet = new Set(selectedIds);

    const added = selectedIds.filter((id) => !initialSet.has(id)).length;
    const removed = currentIds.filter((id) => !selectedSet.has(id)).length;

    return { added, removed, changed: added > 0 || removed > 0 };
  }, [currentIds, selectedIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-6 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-900 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Shield className="size-5" />
            </div>
            Quản lý quyền cho vai trò: <span className="text-sky-600 dark:text-sky-400">{role?.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-10">
            Chọn hoặc bỏ chọn các hộp kiểm để phân quyền chi tiết. Sau đó nhấn nút Lưu thay đổi ở góc dưới.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="py-4 shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm quyền theo tên, module, hành động..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-background/50 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/10 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Scrollable Permissions List */}
        <ScrollArea className="h-[400px] sm:h-[450px] md:h-[500px] border border-slate-100 dark:border-slate-900 rounded-xl p-4 bg-slate-50/[0.07]">
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xs text-muted-foreground italic">
                Không tìm thấy quyền hạn nào phù hợp bộ lọc.
              </p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([resource, perms]) => {
              const selectedInModule = perms.filter((p) => selectedIds.includes(p.id));
              const isAllSelected = selectedInModule.length === perms.length;
              const isSomeSelected = selectedInModule.length > 0 && !isAllSelected;

              const isCollapsed = !!collapsedModules[resource];

              return (
                <div key={resource} className="mb-6 last:mb-0 border border-slate-100 dark:border-slate-900/50 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-950/30 shadow-sm">
                  {/* Module Header Bar */}
                  <div
                    onClick={() => toggleCollapseModule(resource)}
                    className="flex items-center justify-between px-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900/50 cursor-pointer select-none hover:bg-slate-100/80 dark:hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                        onCheckedChange={() => handleToggleModule(perms, isAllSelected)}
                        className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pl-1">
                        {RESOURCE_LABELS[resource] || resource}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Đã chọn {selectedInModule.length} / {perms.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-slate-400 transition-transform duration-200",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                    </div>
                  </div>

                  {/* Permissions Grid */}
                  {!isCollapsed && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                      {perms.map((permission) => {
                        const isChecked = selectedIds.includes(permission.id);
                        return (
                          <div
                            key={permission.id}
                            onClick={() => handleToggle(permission.id)}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                              isChecked
                                ? "border-sky-500 bg-sky-500/[0.03] dark:bg-sky-500/[0.01] ring-2 ring-sky-500/10 shadow-[0_2px_8px_rgba(14,165,233,0.04)]"
                                : "border-slate-100 dark:border-slate-900 bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-200"
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleToggle(permission.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5 border-slate-300 dark:border-slate-700 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                            />
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer truncate">
                                  {permission.name}
                                </label>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-bold px-1.5 py-0 rounded-[4px] border uppercase tracking-wider shrink-0",
                                    getPermissionActionBadgeClass(permission.action)
                                  )}
                                >
                                  {getActionMeta(permission.action)?.label ?? permission.action}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-normal">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <DialogFooter className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-900 shrink-0 flex items-center justify-between w-full sm:flex-row flex-col gap-3">
          <div className="text-[11px] text-muted-foreground text-left w-full sm:w-auto">
            {diffStats.changed ? (
              <span>
                Thay đổi:{" "}
                {diffStats.added > 0 && <strong className="text-emerald-600">+{diffStats.added} gán</strong>}
                {diffStats.added > 0 && diffStats.removed > 0 && ", "}
                {diffStats.removed > 0 && <strong className="text-rose-500">-{diffStats.removed} gỡ</strong>}
              </span>
            ) : (
              "Chưa có thay đổi nào"
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-4 h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 hover:cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isPending || !diffStats.changed}
              onClick={handleSave}
              className="rounded-lg px-5 h-9 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:cursor-pointer"
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
