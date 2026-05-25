'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { otpSchema, type OtpSchemaType } from '@/lib/validations/auth';
import { useVerifyRegisterOtp, useResendRegisterOtp } from '@/apis/auth/queries';
import { getApiErrorMessage } from '@/lib/api-response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const verifyMutation = useVerifyRegisterOtp();
  const resendMutation = useResendRegisterOtp();
  const [cooldown, setCooldown] = React.useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const otpValue = watch('otp');

  React.useEffect(() => {
    if (!email) router.replace(ROUTES.REGISTER);
  }, [email, router]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (data: OtpSchemaType) => {
    try {
      await verifyMutation.mutateAsync({
        email,
        otp: Number(data.otp),
        type: 'REGISTER',
      });
      toast.success('Xác thực thành công! Vui lòng đăng nhập.');
      router.push(ROUTES.LOGIN);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Mã OTP không hợp lệ hoặc đã hết hạn.'));
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendMutation.mutateAsync(email);
      toast.success('Đã gửi lại mã OTP.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi lại mã OTP.'));
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-sky-100/50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] bg-white dark:bg-neutral-900 border border-sky-500/60 dark:border-neutral-800 rounded-[2rem] shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600" />

        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <ShieldCheck className="size-8" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Xác thực OTP</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Nhập mã 6 chữ số đã gửi tới email của bạn
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-medium">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate max-w-[240px]">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input
                {...register('otp')}
                value={otpValue}
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                className="h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border-sky-200 dark:border-sky-900 focus-visible:ring-sky-500/20 bg-neutral-50 dark:bg-neutral-800/60"
                onChange={(e) =>
                  setValue('otp', e.target.value.replace(/\D/g, '').slice(0, 6), { shouldValidate: true })
                }
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mt-2 text-center font-medium">{errors.otp.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20"
            >
              {verifyMutation.isPending ? 'Đang xác thực...' : 'Xác nhận'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              disabled={cooldown > 0 || resendMutation.isPending}
              onClick={handleResend}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
            >
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã OTP'}
            </button>
            <p className="text-xs text-neutral-500">
              Đã có tài khoản?{' '}
              <Link href={ROUTES.LOGIN} className="text-sky-500 font-bold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
