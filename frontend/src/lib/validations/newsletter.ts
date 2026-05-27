import { z } from 'zod';

export const newsletterEmailSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
});
