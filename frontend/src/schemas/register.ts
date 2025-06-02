import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  email: z.string()
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters')
    .email('Invalid email address'),
  recaptchaToken: z.string().optional(),
}).refine((data) => data.password !== data.username, {
  message: "Password cannot be the same as username",
  path: ["password"],
})

export type RegisterFormData = z.infer<typeof registerSchema>