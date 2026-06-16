import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '@packages/error-handler';

export const createValidatePayloadMiddleware = <T extends ZodTypeAny>(
  schema: T,
  invalidMessage: string
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new ValidationError(invalidMessage, details));
    }

    req.body = result.data;
    return next();
  };
};
