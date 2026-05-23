import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/components/ui/popover";
import { userEditSchema, type UserEditFormValues } from "@/shared/lib/validations/user-schema";
import { useUpdateUser } from "../hooks";
import type { User, UpdateUserDto } from "../types";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
};

const fieldClass =
  "rounded-lg h-10 border border-slate-200 dark:border-slate-800 bg-background/50 text-sm focus-visible:ring-3 focus-visible:ring-sky-500/10 focus-visible:border-sky-500 transition-all placeholder:text-muted-foreground/60";

const labelClass =
  "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider";

const STRENGTH_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

function PasswordHints({ password }: { password: string }) {
  const requirements = useMemo(
    () => [
      { label: "Ít nhất 8 ký tự", met: password.length >= 8 },
      {
        label: "Có chữ in hoa và chữ thường",
        met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      { label: "Có ít nhất 1 số", met: /[0-9]/.test(password) },
      {
        label: "Có ít nhất 1 ký tự đặc biệt (!, @, #, ...)",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ],
    [password]
  );

  const metCount = requirements.filter((r) => r.met).length;
  const allMet = metCount === requirements.length;
  const score = Math.max(0, metCount - 1);
  const barColor = STRENGTH_COLORS[Math.min(score, STRENGTH_COLORS.length - 1)];

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {allMet ? (
          <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
        ) : (
          <AlertCircle className="size-5 text-slate-400 shrink-0" />
        )}
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {allMet ? "Mật khẩu mạnh" : "Yêu cầu mật khẩu"}
        </h3>
      </div>
      <div className="flex gap-1 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i <= score ? barColor : "bg-slate-200 dark:bg-slate-800"}`}
          />
        ))}
      </div>
      <ul className="space-y-1.5">
        {requirements.map((req) => (
          <li key={req.label} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            ) : (
              <span className="size-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
            )}
            <span className={req.met ? "text-slate-700 dark:text-slate-300" : "text-slate-500"}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UserDialog({ open, onOpenChange, user }: Props) {
  const updateMutation = useUpdateUser();
  const [hintsOpen, setHintsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const password = watch("password") ?? "";

  useEffect(() => {
    if (open && user) {
      reset({ fullName: user.fullName || "", email: user.email, password: "" });
      setHintsOpen(false);
      setShowPassword(false);
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserEditFormValues) => {
    if (!user) return;

    const payload: UpdateUserDto = { fullName: data.fullName, email: data.email };
    if (data.password.trim()) payload.password = data.password;

    await updateMutation.mutateAsync({ id: user.id, data: payload });
    reset();
    onOpenChange(false);
  };

  const isPending = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Chỉnh sửa người dùng
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cập nhật họ tên, email hoặc mật khẩu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="fullName" className={labelClass}>Họ và tên</Label>
            <Input id="fullName" placeholder="Nhập họ và tên..." {...register("fullName")} className={fieldClass} />
            {errors.fullName && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={labelClass}>Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" {...register("email")} className={fieldClass} />
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={labelClass}>Mật khẩu mới</Label>
            <Popover modal={false} open={hintsOpen}>
              <PopoverAnchor asChild>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Để trống nếu không đổi"
                    autoComplete="new-password"
                    className={`${fieldClass} w-full pr-10`}
                    {...register("password")}
                    onFocus={() => setHintsOpen(true)}
                    onBlur={() => setTimeout(() => setHintsOpen(false), 120)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </PopoverAnchor>
              <PopoverContent
                align="start"
                side="bottom"
                sideOffset={8}
                className="w-[var(--radix-popover-trigger-width)] max-w-none p-0 z-200 border border-slate-200 dark:border-slate-800 shadow-lg"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
              >
                <PasswordHints password={password} />
              </PopoverContent>
            </Popover>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 mt-6 border-t border-slate-100 dark:border-slate-900">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg px-4 h-10 font-semibold border-slate-200 dark:border-slate-800">
              Hủy
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-lg px-5 h-10 font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all active:scale-95">
              {isPending ? "Đang xử lý..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
