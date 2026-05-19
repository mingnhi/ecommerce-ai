'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import { loginSchema, type LoginSchemaType } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.error) {
        toast.success('Đăng nhập thành công!');
        setTimeout(() => router.push(ROUTES.HOME), 500);
        return;
      }

      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } catch {
      toast.error('Đã có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100/50 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">


      {/* Card chính */}
      <div className="w-full max-w-[960px] bg-white dark:bg-neutral-900 border border-sky-500/60 dark:border-neutral-850 rounded-[2rem] shadow-[0_20px_50px_rgba(14,165,233,0.05)] overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 min-h-[580px]">

        {/* Họa tiết tia hoa hướng dương góc dưới bên trái */}
        <div className="absolute -bottom-6 -left-23 pointer-events-none select-none z-0">
          <svg
            width="160"
            height="160"
            viewBox="0 0 120 120"
            fill="currentColor"
            className="text-sky-500"
          >
            <g transform="translate(60, 60)">
              {Array.from({ length: 16 }).map((_, i) => (
                <rect
                  key={i}
                  x="-4"
                  y="-55"
                  width="8"
                  height="35"
                  rx="4"
                  transform={`rotate(${i * 22.5})`}
                />
              ))}
              <circle cx="0" cy="0" r="24" className="fill-white dark:fill-neutral-900 stroke-[8px] stroke-sky-500" />
            </g>
          </svg>
        </div>

        {/* Cột trái: Form Đăng nhập */}
        <div className="p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden min-w-0">
          <div className="w-full max-w-[320px] mx-auto z-10">
            <div className="mb-8 flex flex-col items-start gap-4">
              <Link
                href={ROUTES.HOME}
                className="items-center gap-2 cursor-pointer shrink-0 flex hover:opacity-90 transition-opacity"
              >
                <img
                  src="/images/logo.png"
                  alt="Ecommerce AI Logo"
                  className="h-14 md:h-10 w-auto object-contain transition-all duration-300"
                />
              </Link>
              <div>
                <h1 className="text-[36px] font-black text-neutral-900 dark:text-white leading-none tracking-tight">
                  Đăng nhập
                </h1>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium tracking-wide mt-2">
                  Nền tảng mua sắm thông minh tối ưu bởi AI
                </p>
              </div>
            </div>

            {/* Form tài khoản & mật khẩu */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <User className="h-5 w-5 stroke-[1.5]" />
                </div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Tên tài khoản hoặc Email"
                  className="w-full pl-12 pr-4 h-12 bg-neutral-100/60 dark:bg-neutral-800/60 border-none placeholder-neutral-400 text-sm rounded-xl focus-visible:bg-white dark:focus-visible:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200 outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock className="h-5 w-5 stroke-[1.5]" />
                </div>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  className="w-full pl-12 pr-12 h-12 bg-neutral-100/60 dark:bg-neutral-800/60 border-none placeholder-neutral-400 text-sm rounded-xl focus-visible:bg-white dark:focus-visible:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-sky-500 transition-all duration-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-sky-500/10 transition-all duration-200 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? 'Vui lòng chờ...' : 'Đăng nhập'}
              </Button>
            </form>

            {/* Dòng phân cách phương thức đăng nhập khác */}
            <div className="my-6 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100 dark:border-neutral-800"></div>
              </div>
              <span className="relative px-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest bg-white dark:bg-neutral-900">
                Hoặc đăng nhập bằng
              </span>
            </div>

            {/* Đăng nhập qua mạng xã hội*/}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                disabled={googleLoading}
                className="w-full h-11 border border-neutral-200 dark:border-neutral-855 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer disabled:opacity-60 text-xs"
                onClick={async () => {
                  setGoogleLoading(true);
                  try {
                    await signIn('google', { callbackUrl: ROUTES.HOME });
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 533.5 544.3">
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
                <span>Đăng nhập với Google</span>
              </Button>
            </div>

            <p className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
              Chưa có tài khoản?{' '}
              <Link href={ROUTES.REGISTER} className="text-sky-500 font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>


        <div className="bg-sky-50/30 dark:bg-sky-950/10 hidden md:flex rounded-r-[2rem] col-span-1 relative overflow-hidden min-h-[500px] w-full items-center justify-center p-2 md:p-4 border-l border-sky-100/50 dark:border-neutral-800">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0f2fe_1px,transparent_1px),linear-gradient(to_bottom,#e0f2fe_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

          <div className="relative w-[120%] h-[120%] z-10 flex items-center justify-center scale-110 transition-transform duration-700">
            <Image
              src="/images/login.png"
              alt="Welcome Shopping Illustration"
              width={800}
              height={800}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div >
  );
}
