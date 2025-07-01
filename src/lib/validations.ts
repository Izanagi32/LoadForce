import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email є обов\'язковим')
    .email('Введіть коректний email'),
  password: z
    .string()
    .min(6, 'Пароль повинен містити мінімум 6 символів')
    .max(100, 'Пароль занадто довгий'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>; 