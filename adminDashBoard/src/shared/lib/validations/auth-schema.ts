import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
})

export type LoginForm = z.infer<typeof loginSchema>

const passwordRule = z
  .string()
  .min(1, "Mật khẩu không được để trống")
  .min(6, "Mật khẩu phải có ít nhất 6 ký tự")

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  })

export type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>
