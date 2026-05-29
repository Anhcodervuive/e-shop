import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '@packages/error-handler';
import { registerPayloadSchema } from '@auth/schema';

export const validateRegisterPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = registerPayloadSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return next(new ValidationError('Invalid register payload', details));
  }

  req.body = result.data;
  return next();
};
