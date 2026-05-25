import z from 'zod';

const passwordRule = z.string().nonempty('Mật khẩu không được để trống').min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email không được để trống')
        .email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const registerSchema = z
    .object({
        firstName: z.string().min(1, 'Họ không được để trống'),
        lastName: z.string().min(1, 'Tên không được để trống'),
        email: z.string().email('Email không hợp lệ'),
        password: passwordRule,
        confirmPassword: z.string().nonempty('Vui lòng xác nhận lại mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Mã OTP gồm 6 chữ số')
    .regex(/^\d+$/, 'Chỉ nhập số'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type OtpSchemaType = z.infer<typeof otpSchema>;
export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;
