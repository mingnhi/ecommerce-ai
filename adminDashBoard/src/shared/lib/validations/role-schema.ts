import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(2, "Tên vai trò tối thiểu 2 ký tự"),
  description: z.string().min(5, "Mô tả tối thiểu 5 ký tự"),
});

export const permissionSchema = z.object({
  name: z.string().min(2, "Tên quyền tối thiểu 2 ký tự"),
  resource: z.string().min(2, "Resource tối thiểu 2 ký tự"),
  action: z.string().min(2, "Action tối thiểu 2 ký tự"),
  description: z.string().min(5, "Mô tả tối thiểu 5 ký tự"),
});
