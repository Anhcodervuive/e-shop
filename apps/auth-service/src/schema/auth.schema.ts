import { z } from 'zod';

export const registerPayloadSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const verifyUserPayloadSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  otp: z
    .string({ error: 'OTP is required' })
    .trim()
    .length(6, 'OTP must be exactly 6 characters'),
});

export const loginPayloadSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const forgotPasswordPayloadSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
});

export const resetPasswordPayloadSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  resetToken: z
    .string({ error: 'Reset token is required' })
    .trim()
    .min(1, 'Reset token is required'),
  newPassword: z
    .string({ error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordPayloadSchema>;
export const verifyResetOtpPayloadSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Invalid email format'),
  otp: z
    .string({ error: 'OTP is required' })
    .trim()
    .length(6, 'OTP must be exactly 6 characters'),
});

export type ResetPasswordPayload = z.infer<typeof resetPasswordPayloadSchema>;
export type VerifyResetOtpPayload = z.infer<typeof verifyResetOtpPayloadSchema>;
