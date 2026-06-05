import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const envFileCandidates = [
  path.resolve(process.cwd(), 'apps/auth-service/.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envFileCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const authEnvSchema = z.object({
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().positive('SMTP_PORT must be a positive number'),
  SMTP_SERVICE: z.string().min(1, 'SMTP_SERVICE is required'),
  SMTP_USER: z.string().email('SMTP_USER must be a valid email'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1).optional(),
  HOST: z.string().optional(),
  PORT: z.coerce.number().int().positive().optional(),
});

const parsedEnv = authEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid auth-service environment variables: ${message}`);
}

export const authEnv = {
  ...parsedEnv.data,
  JWT_REFRESH_SECRET: parsedEnv.data.JWT_REFRESH_SECRET ?? parsedEnv.data.JWT_SECRET,
  HOST: parsedEnv.data.HOST ?? 'localhost',
  PORT: parsedEnv.data.PORT ?? 3000,
} as const;
