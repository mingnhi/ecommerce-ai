import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { loginSchema, type LoginForm } from "@/shared/lib/validations/auth-schema";
import { LoginHeroPanel } from "../components/LoginHeroPanel";
import { loginErrorMessage, useLogin } from "../hooks";

const fieldClass =
  "flex h-12 w-full rounded-md border border-border bg-primary/[0.04] px-3 py-2 text-base text-foreground transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";

export function LoginPage() {
  const { mutateAsync: login, isPending, isError, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      await login({ email: data.email.trim(), password: data.password });
    } catch {
      return;
    }
  }

  const errorParam = searchParams.get("error");
  let errMsg = isError ? loginErrorMessage(error) : null;
  if (!errMsg && errorParam === "unauthorized") {
    errMsg = "Tài khoản của bạn không có quyền truy cập trang quản trị.";
  }

  return (
    <div className="min-h-svh w-full max-w-full bg-background text-left antialiased">
      <div className="grid min-h-svh w-full max-w-full grid-cols-1 bg-background lg:grid-cols-2">
        <LoginHeroPanel />

        <main className="relative flex flex-col justify-center bg-background px-6 py-12 sm:px-10 lg:px-12 xl:px-14">
          <div className="relative z-1 mx-auto w-full max-w-xl">
            <Card className="border-primary/15 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] ring-1 ring-primary/10">
              <CardHeader className="space-y-1 border-b border-border/60 pb-5">
                <div className="mb-3 flex items-center gap-3 lg:hidden">
                  <div className="h-8 w-1 rounded-full bg-primary" aria-hidden />
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Console
                  </p>
                </div>
                <CardTitle className="font-heading text-2xl font-medium tracking-[-0.03em] text-foreground">
                  Đăng nhập
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Nhập email và mật khẩu được cấp cho tài khoản quản trị.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="login-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      className={cn(
                        fieldClass,
                        errors.email && "border-destructive focus-visible:border-destructive/35 focus-visible:ring-destructive/15"
                      )}
                      placeholder="name@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-destructive font-medium" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="login-password" className={labelClass}>
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...register("password")}
                        className={cn(
                          fieldClass,
                          "pr-11",
                          errors.password && "border-destructive focus-visible:border-destructive/35 focus-visible:ring-destructive/15"
                        )}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-px top-px flex h-[calc(100%-2px)] w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-destructive font-medium" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {errMsg ? (
                    <p className="text-sm text-destructive font-medium" role="alert">
                      {errMsg}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isPending}
                    size="lg"
                    className="h-12 w-full rounded-md text-sm font-medium tracking-wide hover:cursor-pointer"
                  >
                    {isPending ? "Đang xử lý…" : "Đăng nhập"}
                  </Button>
                </form>

                <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
                  Kết nối được mã hóa. Nếu bạn quên mật khẩu, liên hệ quản trị hệ thống.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
