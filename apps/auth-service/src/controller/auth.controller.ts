import { tryCatch } from '@packages/error-handler';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyResetOtpPayload,
} from '@auth/schema';
import {
  forgotPassword,
  loginUser,
  refreshAuthTokens,
  registerUser,
  resetPassword,
  verifyPasswordReset,
  verifyUser as verifyUserService,
} from '@auth/services/auth.service';
import { AUTH_CACHE_TTL } from '@auth/utils/auth.constants';
import type { Request, Response } from 'express';

// Register a new user
export const userRegistration = tryCatch(async (req: Request, res: Response) => {
  await registerUser(req.body as RegisterPayload);
  return res.status(200).json({
    message: 'Register payload validated successfully',
  });
});

export const verifyUser = tryCatch(async (req: Request, res: Response) => {
  const { message, user, accessToken, refreshToken } = await verifyUserService(req.body.email, req.body.otp);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CACHE_TTL.ACCESS_TOKEN * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CACHE_TTL.REFRESH_TOKEN * 1000,
  });

  return res.status(200).json({
    message,
    user,
    accessToken,
    refreshToken,
  });
});

export const login = tryCatch(async (req: Request, res: Response) => {
  const { message, user, accessToken, refreshToken } = await loginUser(req.body as LoginPayload);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CACHE_TTL.ACCESS_TOKEN * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CACHE_TTL.REFRESH_TOKEN * 1000,
  });

  return res.status(200).json({
    message,
    user,
    accessToken,
    refreshToken,
  });
});

export const refreshToken = tryCatch(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const { accessToken, refreshToken: rotatedRefreshToken } = await refreshAuthTokens(token);

  res.cookie('refreshToken', rotatedRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CACHE_TTL.REFRESH_TOKEN * 1000,
  });

  return res.status(200).json({
    accessToken,
    refreshToken: rotatedRefreshToken,
  });
});

export const forgotPasswordHandler = tryCatch(async (req: Request, res: Response) => {
  const { message } = await forgotPassword(req.body as ForgotPasswordPayload);
  return res.status(200).json({ message });
});

export const verifyResetOtpHandler = tryCatch(async (req: Request, res: Response) => {
  const { message, resetToken } = await verifyPasswordReset(req.body as VerifyResetOtpPayload);
  return res.status(200).json({ message, resetToken });
});

export const resetPasswordHandler = tryCatch(async (req: Request, res: Response) => {
  const { message } = await resetPassword(req.body as ResetPasswordPayload);
  return res.status(200).json({ message });
});
