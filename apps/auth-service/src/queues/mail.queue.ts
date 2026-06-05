import { Queue } from 'bullmq';
import { authEnv } from '@auth/utils/auth.env';

export const OTP_EMAIL_QUEUE = 'otp-email-queue';
export const OTP_EMAIL_JOB = 'send-otp-email';

export type OtpEmailJobData = {
  email: string;
  name: string;
  otp: number;
  template: string;
};

export const otpEmailQueue = new Queue<OtpEmailJobData>(OTP_EMAIL_QUEUE, {
  connection: {
    url: authEnv.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const enqueueOtpEmail = async (data: OtpEmailJobData) => {
  const safeEmail = data.email.replace(/[^a-zA-Z0-9_-]/g, '_');
  await otpEmailQueue.add(OTP_EMAIL_JOB, data, {
    jobId: `otp_${safeEmail}_${Date.now()}`,
  });
};

export const closeOtpEmailQueue = async () => {
  await otpEmailQueue.close();
};
