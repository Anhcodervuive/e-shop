import { Worker } from 'bullmq';
import { sendEmail } from '../utils/sendMail';
import { OTP_EMAIL_JOB, OTP_EMAIL_QUEUE, type OtpEmailJobData } from '../queues/mail.queue';
import { authEnv } from '@auth/utils/auth.env';

let mailWorker: Worker<OtpEmailJobData> | null = null;

export const startMailWorker = () => {
  if (mailWorker) {
    return mailWorker;
  }

  mailWorker = new Worker<OtpEmailJobData>(
    OTP_EMAIL_QUEUE,
    async (job) => {
      if (job.name !== OTP_EMAIL_JOB) {
        return;
      }

      const { email, name, otp, template } = job.data;
      const sent = await sendEmail(email, 'Verify Your Email', template, { name, otp });

      if (!sent) {
        throw new Error(`Failed to send OTP email to ${email}`);
      }
    },
    {
      connection: {
        url: authEnv.REDIS_URL,
        maxRetriesPerRequest: null,
      },
      concurrency: 5,
    }
  );

  mailWorker.on('failed', (job, err) => {
    console.error(`Mail job ${job?.id} failed:`, err.message);
  });

  return mailWorker;
};

export const stopMailWorker = async () => {
  if (!mailWorker) {
    return;
  }

  await mailWorker.close();
  mailWorker = null;
};
