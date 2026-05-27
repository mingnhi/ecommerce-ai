import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import {
  updatePasswordSchema,
  type UpdatePasswordForm,
} from "@/shared/lib/validations/auth-schema";
import { getApiMessage, isApiSuccess, parseApiError } from "../lib";
import { useUpdatePassword } from "../hooks";

const fieldClass =
  "pl-11 rounded-xl h-11 border-slate-200/80 bg-slate-50/50 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900/50";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { mutateAsync: updatePassword, isPending } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordForm) => {
    try {
      const response = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        logoutAllSessions: false,
      });

      if (!isApiSuccess(response)) {
        toast.error(getApiMessage(response, "Đổi mật khẩu thất bại."));
        return;
      }

      toast.success("Đổi mật khẩu thành công!");
      reset();
      navigate("/account/profile");
    } catch (error) {
      toast.error(parseApiError(error, "Đổi mật khẩu thất bại. Vui lòng thử lại."));
    }
  };

  return (
    <div className="mx-auto w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="mb-10 flex flex-col items-center border-b border-slate-100 pb-8 text-center dark:border-slate-800">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-4 ring-sky-50/50 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-950/50">
          <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Đổi mật khẩu
        </h1>
        <p className="mt-2.5 max-w-[320px] text-sm text-slate-500 dark:text-slate-400">
          Đảm bảo tài khoản của bạn đang sử dụng mật khẩu mạnh để an toàn hơn.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <div className="space-y-2.5">
          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className={fieldClass}
              placeholder="Nhập mật khẩu hiện tại..."
              {...register("currentPassword")}
            />
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder="Nhập mật khẩu mới..."
              {...register("newPassword")}
            />
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder="Nhập lại mật khẩu mới..."
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-6 sm:w-auto hover:cursor-pointer"
            onClick={() => navigate("/account/profile")}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-xl bg-sky-500 px-8 text-white hover:bg-sky-600 sm:w-auto cursor-pointer"
            disabled={!isDirty || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </div>
  );
}
