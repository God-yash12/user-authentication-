import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  recaptchaToken: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  recaptchaToken: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otpCode: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;



