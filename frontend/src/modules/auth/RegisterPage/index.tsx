'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Crown, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { registerSchema, type RegisterSchemaType } from '@/lib/validations/auth';
import { useRegister } from '@/apis/auth/queries';
import { PasswordStrengthIndicator } from '@/components/common/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { siteConfig } from '@/configs/site';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordPopoverOpen, setPasswordPopoverOpen] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterSchemaType) => {
    try {
      const response = await registerMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'user',
      });

      if (
        response &&
        (response.succeeded === true || response.status === true) &&
        response.data
      ) {
        toast.success('Đăng ký thành công!');
        setTimeout(() => router.push(ROUTES.LOGIN), 1000);
        return;
      }

      const errorMessage =
        response?.messages?.[0] || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { messages?: string[]; message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.messages?.[0] ||
        err?.response?.data?.message ||
        err?.message ||
        'Đã có lỗi xảy ra khi đăng ký';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center overflow-hidden relative">
      <Link
        href={ROUTES.HOME}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow xl:flex hidden items-center justify-center text-gray-700 hover:bg-gray-200 transition"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="w-full max-w-full xl:w-screen mx-4 my-4 sm:mx-6 xl:mx-36 bg-white shadow rounded-2xl justify-center grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
        <div className="px-4 py-6 col-span-1 xl:order-2 min-w-0">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/10 mb-3">
              <Crown className="h-6 w-6 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Tạo tài khoản {siteConfig.name}
            </h1>
          </div>

          <div className="mt-1 flex flex-col items-center">
            <div className="w-full flex-1">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={async () => {
                    setGoogleLoading(true);
                    try {
                      await signIn('google', { callbackUrl: ROUTES.HOME });
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
                  className="w-full max-w-md font-bold rounded-lg py-2 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out border border-sky-200 cursor-pointer hover:bg-sky-50 disabled:opacity-60"
                >
                  <div className="bg-white p-2 rounded-full">
                    <svg className="w-4" viewBox="0 0 533.5 544.3">
                      <path
                        d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                        fill="#4285f4"
                      />
                      <path
                        d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                        fill="#34a853"
                      />
                      <path
                        d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                        fill="#fbbc04"
                      />
                      <path
                        d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                        fill="#ea4335"
                      />
                    </svg>
                  </div>
                  <span className="ml-4">
                    {googleLoading ? 'Đang chuyển...' : 'Đăng nhập với Google'}
                  </span>
                </button>
              </div>

              <div className="my-5 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Hoặc đăng kí bằng Email
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-md">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      {...register('firstName')}
                      type="text"
                      placeholder="Họ"
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...register('lastName')}
                      type="text"
                      placeholder="Tên"
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email"
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}

                <Popover open={passwordPopoverOpen} onOpenChange={setPasswordPopoverOpen}>
                  <PopoverAnchor asChild>
                    <div className="relative mt-5">
                      <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        className="w-full px-8 py-4 pr-12 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                        onFocus={() => setPasswordPopoverOpen(true)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </PopoverAnchor>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    className="w-[var(--radix-popover-trigger-width)] max-w-md p-0 border shadow-lg"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <PasswordStrengthIndicator password={password ?? ''} />
                  </PopoverContent>
                </Popover>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}

                <div className="relative mt-5">
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full px-8 py-4 pr-12 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="mt-5 tracking-wide font-semibold bg-sky-600 hover:bg-sky-700 text-white w-full py-4 rounded-lg transition-all duration-300 ease-in-out hover:cursor-pointer disabled:opacity-50"
                >
                  {registerMutation.isPending ? 'Đang đăng ký...' : 'Đăng kí'}
                </Button>
              </form>

              <p className="mt-6 text-sm text-gray-600 text-center">
                Đã có tài khoản?{' '}
                <Link
                  href={ROUTES.LOGIN}
                  className="text-sky-600 font-semibold hover:underline ml-1 hover:cursor-pointer"
                >
                  Đăng nhập
                </Link>
              </p>
              <p className="mt-6 text-xs text-gray-600 text-center">
                Bằng việc đăng kí, bạn đồng ý với{' '}
                <Link href="#" className="border-b border-gray-500 border-dotted ml-1">
                  Điều khoản dịch vụ
                </Link>{' '}
                và{' '}
                <Link href="#" className="border-b border-gray-500 border-dotted ml-1">
                  Chính sách bảo mật
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-sky-50 hidden xl:flex rounded-l-2xl col-span-1 xl:order-first relative overflow-hidden min-h-[480px] w-full">
          <div className="absolute inset-0 w-full h-full min-h-[480px]">
            <Image
              src="/images/bn-register.png"
              alt=""
              fill
              className="object-fill"
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
            />
            <div className="absolute inset-0" aria-hidden />
          </div>
         
        </div>
      </div>
    </div>
  );
}
