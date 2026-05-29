import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';
import { enqueueOtpEmail } from '@auth/queues/mail.queue';

export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
}

export const sendOtp = async (name: string, email: string, template: string): Promise<void> => {
  const otp = crypto.randomInt(1000, 9999);
  await redis.set(`otp:${email}`, otp.toString(), 'EX', 300); // OTP expires in 5 minutes
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // Cooldown of 1 minute before requesting another OTP
  await enqueueOtpEmail({ email, name, otp, template });
}

export const checkOtpRestriction = async (email: string) => {
  if(await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError('Account lock due to multiple failed OTP attempts. Please try again later.');
  }

  if(await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError('Too many OTP requests. Please try again later.');
  }

  if(await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError('OTP request cooldown active. Please wait before requesting another OTP.');
  }
}

export const trackOtpRequest = async (email: string) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequests = parseInt(await redis.get(otpRequestKey) || '0');

  if(otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    throw new ValidationError('Too many OTP requests. Please try again later.');
  }
  await redis.set(otpRequestKey, (otpRequests + 1).toString(), 'EX', 3600);
}
