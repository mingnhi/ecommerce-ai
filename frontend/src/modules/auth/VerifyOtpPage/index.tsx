"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { toast } from "sonner";

import { ROUTES } from "@/lib/routes";
import { FORGOT_PASSWORD_OTP_KEY } from "@/lib/const";

import { otpSchema, type OtpSchemaType } from "@/lib/validations/auth";

import {
  useVerifyRegisterOtp,
  useResendRegisterOtp,
  useResendForgotPasswordOtp,
} from "@/apis/auth/queries";

import { getApiErrorMessage } from "@/lib/api-response";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const type = searchParams.get("type") ?? "register";

  const isRegister = type === "register";

  const isForgotPassword = type === "forgot-password";

  const verifyRegisterMutation = useVerifyRegisterOtp();

  const resendRegisterMutation = useResendRegisterOtp();

  const resendForgotPasswordMutation = useResendForgotPasswordOtp();

  const [cooldown, setCooldown] = React.useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otpValue = watch("otp");

  React.useEffect(() => {
    if (!email) {
      router.replace(ROUTES.REGISTER);
    }
  }, [email, router]);

  React.useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (data: OtpSchemaType) => {
    if (isRegister) {
      try {
        await verifyRegisterMutation.mutateAsync({
          email,
          otp: Number(data.otp),
          type: "REGISTER",
        });

        toast.success("Xác thực thành công! Vui lòng đăng nhập.");

        router.push(ROUTES.LOGIN);
      } catch (err) {
        toast.error(
          getApiErrorMessage(err, "Mã OTP không hợp lệ hoặc đã hết hạn."),
        );
      }
    } else if (isForgotPassword) {
      sessionStorage.setItem(FORGOT_PASSWORD_OTP_KEY, data.otp);

      router.push(
        `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`,
      );
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      if (isRegister) {
        await resendRegisterMutation.mutateAsync(email);
      } else if (isForgotPassword) {
        await resendForgotPasswordMutation.mutateAsync(email);
      }

      toast.success("Đã gửi lại mã OTP.");

      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Không thể gửi lại mã OTP."));
    }
  };

  if (!email) return null;

  const backUrl = isRegister ? ROUTES.REGISTER : ROUTES.FORGOT_PASSWORD;

  const backText = isRegister ? "Quay lại đăng ký" : "Nhập lại email";

  const title = isRegister ? "Xác thực tài khoản" : "Xác thực OTP";

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-100/50 p-4 dark:bg-neutral-950 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-sky-500/60 bg-white shadow-[0_20px_50px_rgba(14,165,233,0.15)] dark:border-neutral-800 dark:bg-neutral-900">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600" />

        <div className="p-8 sm:p-10">
          <Link
            href={backUrl}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-sky-600"
          >
            <ArrowLeft className="size-4" />
            {backText}
          </Link>

          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
              <ShieldCheck className="size-8" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Nhập mã 6 chữ số đã gửi tới email của bạn
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              <Mail className="size-3.5 shrink-0" />

              <span className="max-w-[240px] truncate">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input
                {...register("otp")}
                value={otpValue}
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                className="h-14 rounded-xl border-sky-200 bg-neutral-50 text-center text-2xl font-bold tracking-[0.5em] dark:border-sky-900 dark:bg-neutral-800/60 focus-visible:ring-sky-500/20"
                onChange={(e) =>
                  setValue(
                    "otp",
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                    {
                      shouldValidate: true,
                    },
                  )
                }
              />

              {errors.otp && (
                <p className="mt-2 text-center text-xs font-medium text-red-500">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={verifyRegisterMutation.isPending}
              className="h-12 w-full rounded-xl bg-sky-500 font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600"
            >
              {verifyRegisterMutation.isPending
                ? "Đang xác thực..."
                : isForgotPassword
                  ? "Tiếp tục"
                  : "Xác nhận"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              type="button"
              disabled={
                cooldown > 0 ||
                resendRegisterMutation.isPending ||
                resendForgotPasswordMutation.isPending
              }
              onClick={handleResend}
              className="text-sm font-semibold text-sky-600 transition-colors hover:text-sky-700 disabled:cursor-not-allowed disabled:text-neutral-400"
            >
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã OTP"}
            </button>

            <p className="text-xs text-neutral-500">
              Đã có tài khoản?{" "}
              <Link
                href={ROUTES.LOGIN}
                className="font-bold text-sky-500 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
