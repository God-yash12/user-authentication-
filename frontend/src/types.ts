import { z } from 'zod';

// Password Strength
export const PasswordStrengthLevel = {
  EMPTY: 'EMPTY',
  VERY_WEAK: 'VERY_WEAK',
  WEAK: 'WEAK',
  MEDIUM: 'MEDIUM',
  STRONG: 'STRONG',
  VERY_STRONG: 'VERY_STRONG',
} as const;

export type PasswordStrengthLevel =
  typeof PasswordStrengthLevel[keyof typeof PasswordStrengthLevel];

  
export interface PasswordRequirement {
  id: string;
  text: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0-5 or similar scale
  level: PasswordStrengthLevel;
  suggestions: string[];
  requirements: PasswordRequirement[];
}

// Registration Form Schema
export const registrationFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }).max(20, { message: "Username must be at most 20 characters long" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
  captchaInput: z.string().min(1, { message: "CAPTCHA is required" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Point error to confirmPassword field
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

// User
export interface User {
  id: string;
  username: string;
}

// API Simulation
export interface SimulatedRegistrationResponse {
  success: boolean;
  message: string;
  user?: User;
}