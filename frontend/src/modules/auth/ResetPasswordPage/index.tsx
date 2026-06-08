'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { resetPasswordSchema, type ResetPasswordSchemaType } from '@/lib/validations/auth';
import { useResetPassword } from '@/apis/auth/queries';
import { getApiErrorMessage, getApiMessage, isApiSuccess } from '@/lib/api-response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FORGOT_PASSWORD_OTP_KEY = 'forgot_password_otp';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const resetMutation = useResetPassword();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  React.useEffect(() => {
    const otp = sessionStorage.getItem(FORGOT_PASSWORD_OTP_KEY);
    if (!email || !otp) {
      router.replace(ROUTES.FORGOT_PASSWORD);
    }
  }, [email, router]);

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    const otp = sessionStorage.getItem(FORGOT_PASSWORD_OTP_KEY);
    if (!otp) {
      toast.error('Phiên xác thực đã hết hạn. Vui lòng thử lại.');
      router.replace(ROUTES.FORGOT_PASSWORD);
      return;
    }

    try {
      const response = await resetMutation.mutateAsync({
        email,
        otp: Number(otp),
        newPassword: data.newPassword,
      });

      if (isApiSuccess(response)) {
        sessionStorage.removeItem(FORGOT_PASSWORD_OTP_KEY);
        toast.success(getApiMessage(response, 'Đặt lại mật khẩu thành công!'));
        router.push(ROUTES.LOGIN);
        return;
      }

      toast.error(getApiMessage(response, 'Đặt lại mật khẩu thất bại.'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Đặt lại mật khẩu thất bại.'));
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-sky-100/50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] bg-white dark:bg-neutral-900 border border-sky-500/60 dark:border-neutral-800 rounded-4xl shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-sky-400 via-sky-500 to-sky-600" />

        <div className="p-8 sm:p-10">
          <Link
            href={`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}&type=FORGOT_PASSWORD`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-sky-600 transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Quay lại nhập OTP
          </Link>

          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <KeyRound className="size-8" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Đặt lại mật khẩu</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Tạo mật khẩu mới cho tài khoản{' '}
              <span className="font-semibold text-sky-600 dark:text-sky-400">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="h-5 w-5 stroke-[1.5]" />
              </div>
              <Input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu mới"
                autoComplete="new-password"
                className="w-full pl-12 pr-12 h-12 bg-neutral-100/60 dark:bg-neutral-800/60 border-none placeholder-neutral-400 text-sm rounded-xl focus-visible:bg-white dark:focus-visible:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="h-5 w-5 stroke-[1.5]" />
              </div>
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu mới"
                autoComplete="new-password"
                className="w-full pl-12 pr-12 h-12 bg-neutral-100/60 dark:bg-neutral-800/60 border-none placeholder-neutral-400 text-sm rounded-xl focus-visible:bg-white dark:focus-visible:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 mt-2"
            >
              {resetMutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Nhớ mật khẩu?{' '}
            <Link href={ROUTES.LOGIN} className="text-sky-500 font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
