import { z } from 'zod';

// Add these to your existing schemas
export const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const verifyOtpSchemaForgetPassword = z.object({
  email: z.string().email(),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
export type VerifyOtpFormDataForgetPassword = z.infer<typeof verifyOtpSchemaForgetPassword>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;