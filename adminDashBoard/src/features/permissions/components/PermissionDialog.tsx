import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldPlus } from "lucide-react";
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
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { permissionSchema } from "@/shared/lib/validations/role-schema";
import {
  createPermissionDraft,
  getActionMeta,
  getActionsForResource,
  getPermissionResources,
  PERMISSION_RESOURCE_LABELS,
  type PermissionResource,
} from "@/shared/lib/casl/permission-actions";
import { cn } from "@/shared/lib/utils";
import { useCreatePermission, useUpdatePermission, usePermissions } from "../hooks";
import type { Permission, PermissionFormData } from "../../roles/types";
import { getPermissionActionBadgeClass } from "@/shared/lib/casl/permission-badge";
import { PermissionActionGrid } from "./PermissionActionGrid";

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

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: { name: "", resource: "", action: "", description: "" },
  });

  const selectedResource = form.watch("resource") as PermissionResource | "";
  const selectedAction = form.watch("action");
  const actionMeta = selectedAction ? getActionMeta(selectedAction) : undefined;

  const moduleOptions = useMemo(() => {
    return getPermissionResources().map((resource) => {
      const allActions = getActionsForResource(resource);
      const taken = new Set(
        permissions.filter((p) => p.resource === resource).map((p) => p.action)
      );
      const availableCount = allActions.filter((action) => !taken.has(action)).length;

      return {
        resource,
        isFull: availableCount === 0,
        availableCount,
        totalCount: allActions.length,
      };
    });
  }, [permissions]);

  const selectedModule = moduleOptions.find((item) => item.resource === selectedResource);
  const isSelectedModuleFull = Boolean(selectedModule?.isFull);

  const takenActions = useMemo(() => {
    if (!selectedResource) return new Set<string>();
    return new Set(
      permissions
        .filter((p) => p.resource === selectedResource && p.id !== permission?.id)
        .map((p) => p.action)
    );
  }, [permissions, selectedResource, permission?.id]);

  const availableActions = useMemo(() => {
    if (!selectedResource || (!isEdit && isSelectedModuleFull)) return [];
    return getActionsForResource(selectedResource).filter((a) => !takenActions.has(a));
  }, [selectedResource, takenActions, isSelectedModuleFull, isEdit]);

  useEffect(() => {
    if (!open || isEdit || !selectedResource || !isSelectedModuleFull) return;
    form.setValue("resource", "");
    form.setValue("action", "");
    form.setValue("name", "");
    form.setValue("description", "");
  }, [open, isEdit, selectedResource, isSelectedModuleFull, form]);

  useEffect(() => {
    if (!open) return;
    if (permission) {
      form.reset({
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      });
      return;
    }
    form.reset({ name: "", resource: "", action: "", description: "" });
  }, [open, permission, form]);

  useEffect(() => {
    if (!selectedResource || !selectedAction) return;
    const draft = createPermissionDraft(selectedResource, selectedAction);
    if (!draft) return;
    form.setValue("name", draft.name, { shouldValidate: true });
    form.setValue("description", draft.description, { shouldValidate: true });
  }, [selectedResource, selectedAction, form]);

  const onSubmit = async (data: PermissionFormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: permission.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200/80 p-0 shadow-2xl sm:max-w-xl dark:border-slate-800">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <ShieldPlus className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {isEdit ? "Chỉnh sửa quyền" : "Tạo quyền mới"}
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed">
                Chọn module và hành động — hệ thống tự điền tên và mô tả
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[min(60vh,520px)]">
          <form
            id="permission-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 px-6 py-5"
          >
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bước 1 · Module
              </Label>
              <Controller
                control={form.control}
                name="resource"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(v) => {
                      const option = moduleOptions.find((item) => item.resource === v);
                      if (!isEdit && option?.isFull) return;

                      field.onChange(v);
                      form.setValue("action", "");
                      form.setValue("name", "");
                      form.setValue("description", "");
                    }}
                    disabled={isEdit}
                  >
                    <SelectTrigger
                      type="button"
                      className="h-10 w-full rounded-lg border-slate-200 dark:border-slate-700"
                    >
                      <SelectValue placeholder="Chọn module..." />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={4}
                      className="z-[100] max-h-72 w-[var(--radix-select-trigger-width)] rounded-lg"
                    >
                      {moduleOptions.map((option) => (
                        <SelectItem
                          key={option.resource}
                          value={option.resource}
                          disabled={!isEdit && option.isFull}
                          className={cn(
                            !isEdit &&
                              option.isFull &&
                              "cursor-not-allowed data-disabled:opacity-100"
                          )}
                        >
                          <span className="flex w-full items-center justify-between gap-2">
                            <span
                              className={cn(
                                "truncate",
                                !isEdit && option.isFull && "text-muted-foreground"
                              )}
                            >
                              {PERMISSION_RESOURCE_LABELS[option.resource]} · {option.resource}
                            </span>
                            {!isEdit && option.isFull && (
                              <Badge
                                variant="outline"
                                className="shrink-0 border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400"
                              >
                                Đã đủ quyền
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.resource && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.resource.message}
                </p>
              )}
            </div>

            {selectedResource && isSelectedModuleFull && !isEdit && (
              <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-4 py-5 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Module {PERMISSION_RESOURCE_LABELS[selectedResource]} đã đủ quyền
                </p>
                <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300/90">
                  Đã tạo {selectedModule?.totalCount}/{selectedModule?.totalCount} quyền cho module này.
                </p>
              </div>
            )}

            {selectedResource && !isSelectedModuleFull && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bước 2 · Hành động
                  <span className="ml-2 font-normal normal-case text-sky-600">
                    {availableActions.length} khả dụng
                  </span>
                </Label>
                <Controller
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <PermissionActionGrid
                      actions={availableActions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {form.formState.errors.action && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.action.message}
                  </p>
                )}
              </div>
            )}

            {actionMeta && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Xem trước
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-bold", getPermissionActionBadgeClass(selectedAction))}
                  >
                    {actionMeta.label}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {actionMeta.method}
                  </Badge>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {form.watch("description") || actionMeta.description}
                </p>
              </div>
            )}

            {selectedAction && selectedAction !== "manage" && (
              <div className="space-y-2">
                <Label htmlFor="permission-description" className="text-xs font-medium">
                  Mô tả bổ sung
                </Label>
                <Textarea
                  id="permission-description"
                  rows={3}
                  {...form.register("description")}
                  className="resize-none rounded-lg border-slate-200 text-sm dark:border-slate-700"
                />
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/30 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="permission-form"
            disabled={
              isPending ||
              !selectedResource ||
              !selectedAction ||
              (!isEdit && isSelectedModuleFull)
            }
            className="rounded-lg bg-sky-600 px-6 hover:bg-sky-700"
          >
            {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo quyền"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
