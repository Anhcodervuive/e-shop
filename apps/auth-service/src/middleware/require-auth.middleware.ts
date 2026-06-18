import type { NextFunction, Request, Response } from 'express';
import { AuthorizationError } from '@packages/error-handler';
import { verifyAccessToken } from '@auth/utils/auth.access-token';

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const requireAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AuthorizationError('Access token is required'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.authUser = {
      userId: decoded.userId,
      email: decoded.email,
    };
    return next();
  } catch {
    return next(new AuthorizationError('Access token is invalid or expired'));
  }
};
