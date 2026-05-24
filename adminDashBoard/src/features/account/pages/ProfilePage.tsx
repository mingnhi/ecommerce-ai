import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Camera,
  Loader2,
  MapPin,
  Phone,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { profileSchema, type ProfileFormValues } from "@/shared/lib/validations/profile-schema";
import { useMe } from "@/features/auth/hooks";
import { useProfile, useUpdateAvatar, useUpdateProfile } from "../hooks";
import { isApiSuccess, parseApiError, toDateInput } from "../lib";
import type { Gender } from "../types";

const fieldClass =
  "pl-10 rounded-xl h-11 border-slate-200/80 bg-slate-50/50 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900/50";

export default function ProfilePage() {
  const { data: user } = useMe();
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile();
  const { mutateAsync: updateAvatar, isPending: uploading } = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: undefined,
    },
  });

  const avatarSrc = profile?.avatarUrl ?? undefined;
  const displayName = profile?.fullName ?? user?.fullName ?? "Quản trị viên";

  useEffect(() => {
    if (!user && !profile) return;
    reset({
      fullName: profile?.fullName ?? user?.fullName ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      dateOfBirth: toDateInput(profile?.dateOfBirth),
      gender: (profile?.gender as Gender) ?? undefined,
    });
  }, [user, profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await updateProfile({
        fullName: data.fullName,
        phone: data.phone || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
      });
      if (!isApiSuccess(response)) {
        toast.error("Cập nhật thất bại.");
        return;
      }
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error(parseApiError(error, "Cập nhật thất bại. Vui lòng thử lại."));
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa là 5MB.");
      return;
    }

    try {
      const response = await updateAvatar(file);
      if (!isApiSuccess(response)) {
        toast.error("Cập nhật avatar thất bại.");
        return;
      }
      toast.success("Cập nhật avatar thành công!");
    } catch (error) {
      toast.error(parseApiError(error, "Cập nhật avatar thất bại."));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="mb-8 border-b border-slate-100 pb-6 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Thông tin tài khoản
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Quản lý thông tin cá nhân của bạn.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            className="group relative cursor-pointer rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-36 w-36 ring-4 ring-sky-50 shadow-lg dark:ring-sky-950">
              <AvatarImage key={avatarSrc} src={avatarSrc} alt={displayName} className="object-cover" />
              <AvatarFallback className="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <UserIcon className="h-14 w-14" />
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity",
                uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <Camera className="h-8 w-8 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{displayName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <p className="max-w-[160px] text-center text-xs text-slate-400">
            JPEG, PNG, GIF. Tối đa 5MB.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="fullName" className={fieldClass} placeholder="Nhập họ và tên..." {...register("fullName")} />
              </div>
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="phone" className={fieldClass} placeholder="Nhập số điện thoại..." {...register("phone")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="dateOfBirth" type="date" className={fieldClass} {...register("dateOfBirth")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Giới tính</Label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className={`${fieldClass} w-full`}>
                        <SelectValue placeholder="Chọn giới tính..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="address" className={fieldClass} placeholder="Nhập địa chỉ..." {...register("address")} />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Địa chỉ Email</Label>
              <Input
                value={user?.email ?? ""}
                readOnly
                disabled
                className="h-11 cursor-not-allowed rounded-xl border-transparent bg-slate-100/80 text-slate-500 dark:bg-slate-900/80"
              />
              <p className="text-xs text-slate-400">
                Email không thể thay đổi do được liên kết bảo mật với tài khoản.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 ">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-6 hover:cursor-pointer"
              onClick={() => reset()}
              disabled={!isDirty || saving}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-xl bg-sky-500 px-8 text-white hover:bg-sky-600 cursor-pointer"
              disabled={!isDirty || saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
