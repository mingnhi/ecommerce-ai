'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Crown, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center overflow-hidden relative">
      <Link
        href={ROUTES.HOME}
        className="absolute xl:flex hidden top-4 left-4 w-10 h-10 rounded-full bg-white shadow items-center justify-center text-gray-700 hover:bg-gray-200 transition"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="w-full max-w-full xl:w-screen mx-4 my-4 sm:mx-6 xl:mx-36 bg-white shadow rounded-2xl justify-center grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
        <div className="px-4 py-6 col-span-1 min-w-0">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/10 mb-3">
              <Crown className="h-6 w-6 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Chào mừng đến với LearnKing
            </h1>
          </div>

          <div className="mt-1 flex flex-col items-center">
            <div className="w-full flex-1">
              <div className="flex flex-col items-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={googleLoading}
                  className="w-full max-w-md font-bold rounded-lg py-2 hover:bg-sky-50 border border-sky-200 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out cursor-pointer"
                  onClick={async () => {
                    setGoogleLoading(true);
                    try {
                      await signIn('google', { callbackUrl: ROUTES.HOME });
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
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
                </Button>
              </div>

              <div className="my-6 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Hoặc đăng nhập bằng Email
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mx-auto w-full max-w-md"
              >
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email"
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}

                <div className="relative mt-5">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    className="w-full px-8 py-4 pr-12 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-md focus:outline-none focus:border-gray-400 focus:bg-white"
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
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-5 tracking-wide font-semibold bg-sky-600 hover:bg-sky-700 text-white w-full py-4 rounded-lg transition-all duration-300 ease-in-out hover:cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </form>

              <p className="mt-4 text-sm text-gray-600 text-center">
                Chưa có tài khoản?{' '}
                <Link
                  href={ROUTES.REGISTER}
                  className="text-sky-600 font-semibold hover:underline ml-1 hover:cursor-pointer"
                >
                  Đăng kí ngay
                </Link>
              </p>
              <p className="mt-6 text-xs text-gray-600 text-center">
                Bằng việc đăng nhập, bạn đồng ý với{' '}
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

        <div className="bg-sky-50 hidden xl:flex rounded-r-2xl col-span-1 relative overflow-hidden min-h-[480px] w-full">
          <div className="absolute inset-0 w-full h-full min-h-[480px]">
            <Image
              src="/images/bn-login.png"
              alt=""
              fill
              className="object-fill"
              sizes="(max-width: 1280px) 0vw, 50vw"
            />
            <div className="absolute inset-0" aria-hidden />
          </div>
         
        </div>
      </div>
    </div>
  );
}
