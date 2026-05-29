"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, MapPin, Phone, User as UserIcon, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getImageUrl } from "@/lib/api-assets";
import { getApiErrorMessage } from "@/lib/api-response";

import { useAppSelector } from "@/stores";
import { selectUser } from "@/stores/user/selectors";
import { useUpdateAvatar, useUpdateProfile, useGetProfile } from "@/apis/auth/queries";
import type { Gender } from "@/apis/auth/types";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const user = useAppSelector(selectUser);
  const { data: profileResponse } = useGetProfile();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutateAsync: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar();

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

  const profile = profileResponse?.data;
  const avatarSrc = getImageUrl(user?.image ?? profile?.avatarUrl);

  useEffect(() => {
    if (user || profile) {
      reset({
        fullName: profile?.fullName ?? user?.fullName ?? "",
        phone: profile?.phone ?? "",
        address: profile?.address ?? "",
        dateOfBirth: profile?.dateOfBirth
          ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
          : "",
        gender: (profile?.gender as Gender) ?? undefined,
      });
    }
  }, [user, profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        fullName: data.fullName,
        phone: data.phone || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
      });
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Cập nhật thất bại. Vui lòng thử lại."));
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      await updateAvatar(file);
    } catch {
      /* toast handled in mutation */
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8 border-b border-gray-100 pb-6 dark:border-neutral-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
          Thông tin tài khoản
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-neutral-400">
          Quản lý thông tin cá nhân của bạn.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[auto_1fr]">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-36 w-36 ring-4 ring-gray-50 shadow-lg dark:ring-neutral-900">
              <AvatarImage
                key={avatarSrc}
                src={avatarSrc}
                alt={user?.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                <UserIcon className="h-14 w-14" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {isUpdatingAvatar ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <Camera className="h-8 w-8 text-white" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-neutral-100">{user?.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-neutral-400">{user?.email}</p>
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-neutral-500 max-w-[160px]">
            JPEG, PNG, GIF. Tối đa 5MB.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                Họ và tên
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="fullName"
                  className="pl-10 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                  placeholder="Nhập họ và tên..."
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                Số điện thoại
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="phone"
                  className="pl-10 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                  placeholder="Nhập số điện thoại..."
                  {...register("phone")}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                Ngày sinh
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="pl-10 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                  {...register("dateOfBirth")}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                Giới tính
              </Label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="pl-10 rounded-xl bg-gray-50/50 border-gray-200/60 dark:bg-neutral-900/50 dark:border-neutral-800 w-full">
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

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                Địa chỉ
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="address"
                  className="pl-10 rounded-xl bg-gray-50/50 border-gray-200/60 focus-visible:bg-white dark:bg-neutral-900/50 dark:border-neutral-800"
                  placeholder="Nhập địa chỉ..."
                  {...register("address")}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                Địa chỉ Email
              </Label>
              <Input
                value={user?.email ?? ""}
                readOnly
                disabled
                className="rounded-xl bg-gray-100/80 text-gray-500 cursor-not-allowed border-transparent dark:bg-neutral-900/80"
              />
              <p className="text-xs text-gray-400 dark:text-neutral-500">
                Email không thể thay đổi do được liên kết bảo mật với tài khoản.
              </p>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl px-6 h-11 hover:cursor-pointer"
              onClick={() => reset()}
              disabled={!isDirty || isUpdatingProfile}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-8 h-11 bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:cursor-pointer" 
              disabled={!isDirty || isUpdatingProfile}
            >
              {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
