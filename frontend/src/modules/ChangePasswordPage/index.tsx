"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { updatePasswordSchema, type UpdatePasswordSchemaType } from "@/lib/validations/auth";
import { getApiErrorMessage, getApiMessage, isApiSuccess } from "@/lib/api-response";
import { useUpdatePassword } from "@/apis/auth/queries";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { mutateAsync: updatePassword, isPending } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordSchemaType) => {
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
      router.push(ROUTES.PROFILE);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Đổi mật khẩu thất bại. Vui lòng thử lại."));
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-2xl mx-auto">
      <div className="mb-10 flex flex-col items-center text-center border-b border-gray-100 pb-8 dark:border-neutral-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 mb-5 ring-4 ring-sky-50/50 dark:ring-sky-500/5">
          <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          Đổi mật khẩu
        </h1>
        <p className="mt-2.5 text-sm text-gray-500 dark:text-neutral-400 max-w-[320px]">
          Đảm bảo tài khoản của bạn đang sử dụng một mật khẩu dài, ngẫu nhiên để an toàn hơn.
        </p>
      </div>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div className="space-y-2.5">
            <Label htmlFor="currentPassword" className="text-gray-700 font-medium dark:text-neutral-300">
              Mật khẩu hiện tại
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className="pl-11 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                placeholder="Nhập mật khẩu hiện tại..."
                {...register("currentPassword")}
              />
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="newPassword" className="text-gray-700 font-medium dark:text-neutral-300">
              Mật khẩu mới
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="pl-11 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                placeholder="Nhập mật khẩu mới..."
                {...register("newPassword")}
              />
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium dark:text-neutral-300">
              Xác nhận mật khẩu mới
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="pl-11 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                placeholder="Nhập lại mật khẩu mới..."
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl w-full sm:w-auto px-6 h-11 hover:cursor-pointer"
              onClick={() => router.push(ROUTES.PROFILE)}
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="rounded-xl w-full sm:w-auto px-8 h-11 bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all hover:cursor-pointer"
              disabled={!isDirty || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />}
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
