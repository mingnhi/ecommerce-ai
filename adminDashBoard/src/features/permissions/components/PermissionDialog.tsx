import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { permissionSchema } from "@/shared/lib/validations/role-schema";
import { useCreatePermission, useUpdatePermission, usePermissions } from "../hooks";
import type { Permission, PermissionFormData } from "../../roles/types";
import { cn } from "@/shared/lib/utils";
import { Check, Eye, Plus, Pencil, Trash2, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export const RESOURCE_NAMES_VI: Record<string, string> = {
  Product: "sản phẩm",
  Order: "đơn hàng",
  User: "người dùng",
  Role: "vai trò",
  Permission: "quyền hạn",
  all: "tất cả",
};

export const ACTION_NAMES_VI: Record<string, string> = {
  read: "Xem",
  create: "Tạo",
  update: "Cập nhật",
  delete: "Xóa",
  manage: "Toàn quyền",
};

const ACTIONS_LIST = [
  { value: "read", label: "Xem", desc: "Xem chi tiết", icon: Eye, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
  { value: "create", label: "Tạo mới", desc: "Tạo dữ liệu", icon: Plus, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
  { value: "update", label: "Cập nhật", desc: "Sửa đổi dữ liệu", icon: Pencil, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" },
  { value: "delete", label: "Xóa", desc: "Xóa bỏ dữ liệu", icon: Trash2, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20" },
  { value: "manage", label: "Toàn quyền", desc: "Tất cả thao tác", icon: Shield, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/20" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: Permission | null;
};

export function PermissionDialog({ open, onOpenChange, permission }: Props) {
  const isEdit = !!permission;
  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();
  const { data: permissions = [] } = usePermissions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: permission
      ? {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      }
      : { name: "", resource: "", action: "", description: "" },
  });

  const selectedResource = watch("resource");
  const selectedAction = watch("action");

  // Determine if another action has already been created for this resource
  const hasExistingActions = useMemo(() => {
    if (!selectedResource) return false;
    return permissions.some(
      (p) => p.resource === selectedResource && p.id !== permission?.id
    );
  }, [permissions, selectedResource, permission]);

  // Get all existing action values for the selected resource to hide them from choices
  const existingActionsForResource = useMemo(() => {
    if (!selectedResource) return [];
    return permissions
      .filter((p) => p.resource === selectedResource && p.id !== permission?.id)
      .map((p) => p.action);
  }, [permissions, selectedResource, permission]);

  // Determine resources that already have all actions or a "manage" action
  const fullyConfiguredResources = useMemo(() => {
    const resources = ["Product", "Order", "User", "Role", "Permission", "all"];
    return resources.filter((res) => {
      const existing = permissions
        .filter((p) => p.resource === res && p.id !== permission?.id)
        .map((p) => p.action);

      if (existing.includes("manage")) return true;

      const required = ["read", "create", "update", "delete"];
      const hasAll = required.every((act) => existing.includes(act));
      return hasAll;
    });
  }, [permissions, permission]);

  // Synchronize reset when dialog opens or permission changes
  useEffect(() => {
    if (open) {
      if (permission) {
        reset({
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
        });
      } else {
        reset({ name: "", resource: "", action: "", description: "" });
      }
    }
  }, [open, permission, reset]);

  // Automatically calculate permission name
  useEffect(() => {
    if (selectedResource && selectedAction) {
      const resName = RESOURCE_NAMES_VI[selectedResource] || selectedResource.toLowerCase();
      const actName = ACTION_NAMES_VI[selectedAction] || selectedAction;
      setValue("name", `${actName} ${resName}`, { shouldValidate: true });

      if (selectedAction === "manage") {
        setValue("description", `Quản lý toàn bộ chức năng thuộc module ${resName}`, { shouldValidate: true });
      }
    }
  }, [selectedResource, selectedAction, setValue]);

  const onSubmit = async (data: PermissionFormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: permission.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const resourcesList = [
    { value: "Product", label: "Sản phẩm (Product)" },
    { value: "Order", label: "Đơn hàng (Order)" },
    { value: "User", label: "Người dùng (User)" },
    { value: "Role", label: "Vai trò (Role)" },
    { value: "Permission", label: "Quyền hạn (Permission)" },
    { value: "all", label: "Tất cả (all)" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="pb-1.5">
          <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isEdit ? "Chỉnh sửa quyền hạn" : "Tạo quyền hạn mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEdit
              ? "Cập nhật thông tin quyền hạn trong hệ thống"
              : "Thêm quyền hạn mới để gán cho các vai trò"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          <div className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="resource" className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tài nguyên (Resource)</Label>
              <Controller
                control={control}
                name="resource"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-9 border border-slate-200 dark:border-slate-800 rounded-lg bg-background/50 flex items-center justify-between text-xs focus:ring-3 focus:ring-sky-500/10 focus:border-sky-500 transition-all">
                      <SelectValue placeholder="Chọn tài nguyên..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border border-slate-200 dark:border-slate-800">
                      {resourcesList.map((res) => {
                        const isFull = fullyConfiguredResources.includes(res.value);
                        return (
                          <SelectItem
                            key={res.value}
                            value={res.value}
                            disabled={isFull}
                            className={cn(
                              "text-xs hover:cursor-pointer transition-colors w-full",
                              isFull && "opacity-60 hover:bg-transparent dark:hover:bg-transparent"
                            )}
                          >
                            <div className="flex items-center justify-between w-full gap-8">
                              <span>{res.label}</span>
                              {isFull && (
                                <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 shrink-0 select-none">
                                  Đã đủ hành động
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.resource && (
                <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.resource.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hành động (Action)</Label>
              <Controller
                control={control}
                name="action"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIONS_LIST.map((act) => {
                      if (act.value === "manage" && hasExistingActions) {
                        return null;
                      }
                      if (existingActionsForResource.includes(act.value)) {
                        return null;
                      }
                      const isSelected = field.value === act.value;
                      const isManage = act.value === "manage";
                      const Icon = act.icon;
                      return (
                        <button
                          key={act.value}
                          type="button"
                          onClick={() => field.onChange(act.value)}
                          className={cn(
                            "flex flex-col items-start py-1.5 px-2.5 text-left border rounded-lg transition-all duration-200 cursor-pointer w-full select-none gap-1",
                            isManage && "col-span-2",
                            isSelected
                              ? "border-sky-500 bg-sky-500/[0.04] dark:bg-sky-500/[0.02] text-sky-950 dark:text-sky-50 ring-2 ring-sky-500/10 shadow-[0_2px_8px_rgba(14,165,233,0.06)]"
                              : "border-slate-200 dark:border-slate-800 bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "size-6 rounded-md flex items-center justify-center transition-colors shrink-0",
                                  isSelected
                                    ? act.color
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                )}
                              >
                                <Icon className="size-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{act.label}</span>
                                <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                                  {act.value}
                                </span>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                                isSelected
                                  ? "border-sky-500 bg-sky-500 text-white scale-105"
                                  : "border-slate-300 dark:border-slate-700 bg-transparent"
                              )}
                            >
                              {isSelected && <Check className="size-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.action && (
                <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.action.message}</p>
              )}
            </div>
          </div>

          {selectedAction !== "manage" && (
            <div className="space-y-1">
              <Label htmlFor="description" className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về phạm vi của quyền hạn..."
                rows={2}
                {...register("description")}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-background/50 text-xs focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all placeholder:text-muted-foreground/60 resize-none py-1.5"
              />
              {errors.description && (
                <p className="text-[11px] text-destructive mt-0.5 font-medium">{errors.description.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-3 mt-4 border-t border-slate-100 dark:border-slate-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-4 h-9 text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-lg px-5 h-9 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all active:scale-95"
            >
              {isPending ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
