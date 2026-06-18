import { BadRequestError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyResetOtpPayload,
} from '@auth/schema';
import bcrypt from 'bcryptjs';
import redis from '@packages/libs/redis';
import { logger } from '@packages/logger';
import {
  checkOtpRestriction,
  checkPasswordResetRestriction,
  generateRandomToken,
  sendOtp,
  sendPasswordResetOtp,
  trackOtpRequest,
  trackPasswordResetRequest,
  verifyOtp,
  verifyPasswordResetOtp,
} from '@auth/utils/auth.helper';
import { AUTH_CACHE_TTL, AUTH_LIMITS, AUTH_MESSAGES, AUTH_REDIS_KEYS } from '@auth/utils/auth.constants';
import type { Prisma } from '@prisma/client';
import { generateSessionId, signAccessToken, signRefreshToken, verifyRefreshToken } from '@auth/utils/auth.tokens';

export const registerUser = async (payload: RegisterPayload) => {
  logger.debug({
    email: payload.email,
  }, 'registerUser called');
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new BadRequestError(AUTH_MESSAGES.emailInUse);
  }

  await checkOtpRestriction(payload.email);
  await trackOtpRequest(payload.email);

  const passwordHash = await bcrypt.hash(payload.password, AUTH_LIMITS.BCRYPT_SALT_ROUNDS);
  const pendingUser: Prisma.JsonObject = {
    name: payload.name,
    email: payload.email,
    passwordHash,
  };

  await redis.set(
    AUTH_REDIS_KEYS.pendingUser(payload.email),
    JSON.stringify(pendingUser),
    'EX',
    AUTH_CACHE_TTL.PENDING_USER
  );

  await sendOtp(payload.name, payload.email, 'user-activation-mail');
  logger.info({
    email: payload.email,
  }, 'Registration OTP queued');

  return {
    message: AUTH_MESSAGES.registerSuccess,
  };
};

export const verifyUser = async (email: string, otp: string) => {
  logger.debug({ email }, 'verifyUser called');
  const pendingUserData = await redis.get(AUTH_REDIS_KEYS.pendingUser(email));

  if (!pendingUserData) {
    throw new BadRequestError(AUTH_MESSAGES.pendingUserMissing);
  }

  const isValidOtp = await verifyOtp(email, otp);
  if (!isValidOtp) {
    throw new BadRequestError(AUTH_MESSAGES.otpInvalid);
  }

  const pendingUser = JSON.parse(pendingUserData) as {
    name: string;
    email: string;
    passwordHash: string;
  };

  const user = await prisma.user.create({
    data: {
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.passwordHash,
      role: 'user',
      verifiedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      verifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const sessionId = generateSessionId();
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({
    ...tokenPayload,
    sessionId,
  });

  await redis.set(
    AUTH_REDIS_KEYS.refreshToken(user.id),
    JSON.stringify({
      sessionId,
      refreshToken,
    }),
    'EX',
    AUTH_CACHE_TTL.REFRESH_TOKEN
  );

  await redis.del(AUTH_REDIS_KEYS.pendingUser(email));
  logger.info({
    email,
    userId: user.id,
  }, 'User created from pending registration');

  return {
    message: AUTH_MESSAGES.verifySuccess,
    user,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (payload: LoginPayload) => {
  logger.debug({ email: payload.email }, 'loginUser called');
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new BadRequestError(AUTH_MESSAGES.invalidCredentials);
  }

  if (!user.verifiedAt) {
    throw new BadRequestError(AUTH_MESSAGES.accountNotVerified);
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError(AUTH_MESSAGES.invalidCredentials);
  }

  const sessionId = generateSessionId();
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({
    ...tokenPayload,
    sessionId,
  });

  await redis.set(
    AUTH_REDIS_KEYS.refreshToken(user.id),
    JSON.stringify({
      sessionId,
      refreshToken,
    }),
    'EX',
    AUTH_CACHE_TTL.REFRESH_TOKEN
  );

  return {
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verifiedAt: user.verifiedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAuthTokens = async (refreshToken: string) => {
  logger.debug('refreshAuthTokens called');
  const decoded = verifyRefreshToken(refreshToken);
  const storedSession = await redis.get(AUTH_REDIS_KEYS.refreshToken(decoded.userId));

  if (!storedSession) {
    throw new BadRequestError(AUTH_MESSAGES.refreshTokenInvalid);
  }

  const parsedSession = JSON.parse(storedSession) as {
    sessionId: string;
    refreshToken: string;
  };

  if (parsedSession.refreshToken !== refreshToken || parsedSession.sessionId !== decoded.sessionId) {
    throw new BadRequestError(AUTH_MESSAGES.refreshTokenInvalid);
  }

  const accessToken = signAccessToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  });

  const rotatedRefreshToken = signRefreshToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    sessionId: decoded.sessionId,
  });

  await redis.set(
    AUTH_REDIS_KEYS.refreshToken(decoded.userId),
    JSON.stringify({
      sessionId: decoded.sessionId,
      refreshToken: rotatedRefreshToken,
    }),
    'EX',
    AUTH_CACHE_TTL.REFRESH_TOKEN
  );

  return {
    accessToken,
    refreshToken: rotatedRefreshToken,
  };
};

export const logoutUser = async (userId: string) => {
  await redis.del(AUTH_REDIS_KEYS.refreshToken(userId));
  return {
    message: AUTH_MESSAGES.logoutSuccess,
  };
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  logger.debug({ email: payload.email }, 'forgotPassword called');
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new BadRequestError(AUTH_MESSAGES.invalidCredentials);
  }

  if (!user.verifiedAt) {
    throw new BadRequestError(AUTH_MESSAGES.accountNotVerified);
  }

  await checkPasswordResetRestriction(payload.email);
  await trackPasswordResetRequest(payload.email);
  await sendPasswordResetOtp(user.name ?? 'there', payload.email, 'reset-password-mail');
  logger.info({
    email: payload.email,
  }, 'Password reset OTP queued');

  return {
    message: AUTH_MESSAGES.passwordResetRequested,
  };
};

export const verifyPasswordReset = async (payload: VerifyResetOtpPayload) => {
  logger.debug({ email: payload.email }, 'verifyPasswordReset called');
  const pendingOtp = await redis.get(AUTH_REDIS_KEYS.passwordResetOtp(payload.email));
  if (!pendingOtp) {
    throw new BadRequestError(AUTH_MESSAGES.passwordResetPendingMissing);
  }

  const isValidOtp = await verifyPasswordResetOtp(payload.email, payload.otp);
  if (!isValidOtp) {
    throw new BadRequestError(AUTH_MESSAGES.otpInvalid);
  }

  const resetToken = generateRandomToken(16);
  await redis.set(
    AUTH_REDIS_KEYS.passwordResetSession(resetToken),
    payload.email,
    'EX',
    AUTH_CACHE_TTL.PASSWORD_RESET_OTP
  );

  return {
    message: 'OTP verified successfully',
    resetToken,
  };
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  logger.debug({ email: payload.email }, 'resetPassword called');
  const sessionEmail = await redis.get(AUTH_REDIS_KEYS.passwordResetSession(payload.resetToken));
  if (!sessionEmail || sessionEmail !== payload.email) {
    throw new BadRequestError(AUTH_MESSAGES.passwordResetSessionInvalid);
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, AUTH_LIMITS.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { email: payload.email },
    data: { password: passwordHash },
  });

  await redis.del(
    AUTH_REDIS_KEYS.passwordResetOtp(payload.email),
    AUTH_REDIS_KEYS.passwordResetCooldown(payload.email),
    AUTH_REDIS_KEYS.passwordResetRequestCount(payload.email),
    AUTH_REDIS_KEYS.passwordResetLock(payload.email),
    AUTH_REDIS_KEYS.passwordResetSpamLock(payload.email),
    AUTH_REDIS_KEYS.passwordResetAttempts(payload.email),
    AUTH_REDIS_KEYS.passwordResetSession(payload.resetToken)
  );

  return {
    message: AUTH_MESSAGES.passwordResetSuccess,
  };
};
