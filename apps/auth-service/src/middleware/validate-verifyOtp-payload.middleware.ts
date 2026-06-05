import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '@packages/error-handler';
import { verifyUserPayloadSchema } from '@auth/schema';

export const validateVerifyOtpPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = verifyUserPayloadSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return next(new ValidationError('Invalid verify OTP payload', details));
  }

  req.body = result.data;
  return next();
};
