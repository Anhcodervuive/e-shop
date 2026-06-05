import { BadRequestError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import type { RegisterPayload } from '@auth/schema';
import bcrypt from 'bcryptjs';
import redis from '@packages/libs/redis';
import { checkOtpRestriction, sendOtp, trackOtpRequest, verifyOtp } from '@auth/utils/auth.helper';
import { AUTH_CACHE_TTL, AUTH_LIMITS, AUTH_MESSAGES, AUTH_REDIS_KEYS } from '@auth/utils/auth.constants';
import type { Prisma } from '@prisma/client';

export const registerUser = async (payload: RegisterPayload) => {
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

  return {
    message: AUTH_MESSAGES.registerSuccess,
  };
};

export const verifyUser = async (email: string, otp: string) => {
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
      verifiedAt: new Date(),
    },
    omit: { password: true },
  });

  await redis.del(AUTH_REDIS_KEYS.pendingUser(email));

  return {
    message: AUTH_MESSAGES.verifySuccess,
    user,
  };
};
