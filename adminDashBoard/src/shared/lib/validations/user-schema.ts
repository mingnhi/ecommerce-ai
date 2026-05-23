import { z } from "zod";

export function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

export const userEditSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().refine(
    (val) => !val || isPasswordStrong(val),
    "Mật khẩu chưa đáp ứng đủ yêu cầu"
  ),
});

export type UserEditFormValues = z.infer<typeof userEditSchema>;
