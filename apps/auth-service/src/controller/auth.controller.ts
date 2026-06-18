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
  logoutUser,
  refreshAuthTokens,
  registerUser,
  resetPassword,
  verifyPasswordReset,
  verifyUser as verifyUserService,
} from '@auth/services/auth.service';
import { AUTH_CACHE_TTL } from '@auth/utils/auth.constants';
import { logger } from '@packages/logger';
import type { Request, Response } from 'express';

// Register a new user
export const userRegistration = tryCatch(async (req: Request, res: Response) => {
  await registerUser(req.body as RegisterPayload);
  logger.info({
    email: req.body.email,
  }, 'Registration OTP requested');
  return res.status(200).json({
    message: 'Register payload validated successfully',
  });
});

export const verifyUser = tryCatch(async (req: Request, res: Response) => {
  const { message, user, accessToken, refreshToken } = await verifyUserService(req.body.email, req.body.otp);
  logger.info({
    email: req.body.email,
    userId: user.id,
  }, 'User verified and session issued');

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
  logger.info({
    email: req.body.email,
    userId: user.id,
  }, 'User logged in');

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
    logger.warn({
      url: req.url,
    }, 'Refresh token missing on refresh request');
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const { accessToken, refreshToken: rotatedRefreshToken } = await refreshAuthTokens(token);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CACHE_TTL.ACCESS_TOKEN * 1000,
  });

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
  logger.info({
    email: req.body.email,
  }, 'Password reset OTP requested');
  return res.status(200).json({ message });
});

export const verifyResetOtpHandler = tryCatch(async (req: Request, res: Response) => {
  const { message, resetToken } = await verifyPasswordReset(req.body as VerifyResetOtpPayload);
  logger.info({
    email: req.body.email,
  }, 'Password reset OTP verified');
  return res.status(200).json({ message, resetToken });
});

export const resetPasswordHandler = tryCatch(async (req: Request, res: Response) => {
  const { message } = await resetPassword(req.body as ResetPasswordPayload);
  logger.info({
    email: req.body.email,
  }, 'Password reset completed');
  return res.status(200).json({ message });
});

export const logout = tryCatch(async (req: Request, res: Response) => {
  const userId = req.authUser?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { message } = await logoutUser(userId);

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  return res.status(200).json({ message });
});
