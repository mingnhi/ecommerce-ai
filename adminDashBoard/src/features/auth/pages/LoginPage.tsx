import { useState, type FormEvent } from "react";
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
import { LoginHeroPanel } from "../components/LoginHeroPanel";
import { loginErrorMessage, useLogin } from "../hooks";

const fieldClass =
  "flex h-12 w-full rounded-md border border-border bg-primary/[0.04] px-3 py-2 text-base text-foreground transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";

export function LoginPage() {
  const { mutateAsync: login, isPending, isError, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await login({ email: email.trim(), password });
    } catch {
      return;
    }
  }

  const errMsg = isError ? loginErrorMessage(error) : null;

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
                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="login-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                      placeholder="name@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className={labelClass}>
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(fieldClass, "pr-11")}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-px top-px flex h-[calc(100%-2px)] w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {errMsg ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errMsg}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isPending}
                    size="lg"
                    className="h-12 w-full rounded-md text-sm font-medium tracking-wide"
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
