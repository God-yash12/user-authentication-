
import { z } from 'zod';

// Password requirements
const PASSWORD_MIN_LENGTH = 8;

// Username schema
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username cannot exceed 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Email schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email is too short')
  .max(100, 'Email cannot exceed 100 characters');

// Password schema with strength validation
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(100, 'Password cannot exceed 100 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  );

// Signup form schema
export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  recaptchaToken: z.string().min(1, 'Please complete the reCAPTCHA verification'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  recaptchaToken: z.string().min(1, 'Please complete the reCAPTCHA verification'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Verification form schema
export const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits')
});

export type VerificationFormData = z.infer<typeof verificationSchema>;