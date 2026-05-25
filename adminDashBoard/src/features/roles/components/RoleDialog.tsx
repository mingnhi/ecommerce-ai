import { useForm } from "react-hook-form";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { roleSchema } from "@/shared/lib/validations/role-schema";
import { useCreateRole, useUpdateRole } from "../hooks";
import type { Role, RoleFormData } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
};

export function RoleDialog({ open, onOpenChange, role }: Props) {
  const isEdit = !!role;
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: role
      ? { name: role.name, description: role.description }
      : { name: "", description: "" },
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: role.id, data });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{isEdit ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEdit
              ? "Cập nhật thông tin vai trò trong hệ thống"
              : "Thêm vai trò mới để quản lý phân quyền"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên vai trò</Label>
            <Input
              id="name"
              placeholder="ADMIN, USER, MANAGER..."
              {...register("name")}
              className="rounded-lg h-10 border border-slate-200 dark:border-slate-800 bg-background/50 text-sm focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all placeholder:text-muted-foreground/60"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả vai trò và phạm vi quyền hạn..."
              rows={4}
              {...register("description")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-background/50 text-sm focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all placeholder:text-muted-foreground/60 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 mt-6 border-t border-slate-100 dark:border-slate-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-4 h-10 font-semibold border-slate-200 dark:border-slate-800"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-lg px-5 h-10 font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all active:scale-95"
            >
              {isPending ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
