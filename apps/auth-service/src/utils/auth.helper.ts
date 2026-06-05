import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';
import { enqueueOtpEmail } from '@auth/queues/mail.queue';
import { AUTH_CACHE_TTL, AUTH_LIMITS, AUTH_MESSAGES, AUTH_REDIS_KEYS } from './auth.constants';

export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateOtp = (): number => {
  const minOtp = 10 ** (AUTH_LIMITS.OTP_DIGITS - 1);
  const maxOtp = 10 ** AUTH_LIMITS.OTP_DIGITS - 1;
  return crypto.randomInt(minOtp, maxOtp + 1);
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
): Promise<void> => {
  const otp = generateOtp();

  await Promise.all([
    redis.set(AUTH_REDIS_KEYS.otp(email), otp.toString(), 'EX', AUTH_CACHE_TTL.OTP),
    redis.set(AUTH_REDIS_KEYS.otpCooldown(email), 'true', 'EX', AUTH_CACHE_TTL.OTP_COOLDOWN),
    enqueueOtpEmail({ email, name, otp, template }),
  ]);
};

export const checkOtpRestriction = async (email: string) => {
  const [otpLock, otpSpamLock, otpCooldown] = await Promise.all([
    redis.get(AUTH_REDIS_KEYS.otpLock(email)),
    redis.get(AUTH_REDIS_KEYS.otpSpamLock(email)),
    redis.get(AUTH_REDIS_KEYS.otpCooldown(email)),
  ]);

  if (otpLock) {
    throw new ValidationError(AUTH_MESSAGES.otpLocked);
  }

  if (otpSpamLock) {
    throw new ValidationError(AUTH_MESSAGES.otpTooManyRequests);
  }

  if (otpCooldown) {
    throw new ValidationError(AUTH_MESSAGES.otpCooldown);
  }
};

export const trackOtpRequest = async (email: string) => {
  const otpRequestKey = AUTH_REDIS_KEYS.otpRequestCount(email);
  const otpRequests = Number(await redis.get(otpRequestKey) || '0');

  if (otpRequests >= AUTH_LIMITS.MAX_OTP_REQUESTS_PER_WINDOW) {
    await redis.set(AUTH_REDIS_KEYS.otpSpamLock(email), 'locked', 'EX', AUTH_CACHE_TTL.OTP_REQUEST_WINDOW);
    throw new ValidationError(AUTH_MESSAGES.otpTooManyRequests);
  }
  await redis.set(
    otpRequestKey,
    (otpRequests + 1).toString(),
    'EX',
    AUTH_CACHE_TTL.OTP_REQUEST_WINDOW
  );
};

export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const storedOtp = await redis.get(AUTH_REDIS_KEYS.otp(email));
  if (!storedOtp) {
    throw new ValidationError(AUTH_MESSAGES.otpExpired);
  }

  const failedAttemptsKey = AUTH_REDIS_KEYS.otpAttempts(email);
  const failedAttempts = Number(await redis.get(failedAttemptsKey) || '0');

  if (storedOtp !== otp) {
    if (failedAttempts >= AUTH_LIMITS.MAX_OTP_ATTEMPTS) {
      await redis.set(AUTH_REDIS_KEYS.otpLock(email), 'locked', 'EX', AUTH_CACHE_TTL.OTP_LOCK);
      await redis.del(AUTH_REDIS_KEYS.otp(email), failedAttemptsKey);
      throw new ValidationError(AUTH_MESSAGES.otpLocked);
    }
    const remainingAttempts = AUTH_LIMITS.MAX_OTP_ATTEMPTS - failedAttempts - 1;
    await redis.set(failedAttemptsKey, (failedAttempts + 1).toString(), 'EX', AUTH_CACHE_TTL.OTP);
    throw new ValidationError(
      `Invalid OTP. You have ${remainingAttempts} attempts left before account lock.`
    );
  }

  await redis.del(AUTH_REDIS_KEYS.otp(email), failedAttemptsKey);
  return true;
};
