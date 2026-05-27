'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from '@/lib/validations/auth';
import { useForgotPassword } from '@/apis/auth/queries';
import { getApiErrorMessage, getApiMessage, isApiSuccess } from '@/lib/api-response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    try {
      const response = await forgotMutation.mutateAsync({ email: data.email });

      if (isApiSuccess(response)) {
        toast.success(getApiMessage(response, 'Nếu email tồn tại, mã OTP đã được gửi.'));
        router.push(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(data.email)}&type=FORGOT_PASSWORD`);
        return;
      }

      toast.error(getApiMessage(response, 'Không thể gửi mã OTP. Vui lòng thử lại.'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng thử lại.'));
    }
  };

  return (
    <div className="min-h-screen bg-sky-100/50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] bg-white dark:bg-neutral-900 border border-sky-500/60 dark:border-neutral-800 rounded-4xl shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-sky-400 via-sky-500 to-sky-600" />

        <div className="p-8 sm:p-10">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-sky-600 transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Quay lại đăng nhập
          </Link>

          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Mail className="size-8" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quên mật khẩu</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="h-5 w-5 stroke-[1.5]" />
              </div>
              <Input
                {...register('email')}
                type="email"
                placeholder="Địa chỉ email"
                className="w-full pl-12 pr-4 h-12 bg-neutral-100/60 dark:bg-neutral-800/60 border-none placeholder-neutral-400 text-sm rounded-xl focus-visible:bg-white dark:focus-visible:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200 outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={forgotMutation.isPending}
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20"
            >
              {forgotMutation.isPending ? 'Đang gửi...' : 'Gửi mã OTP'}
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
