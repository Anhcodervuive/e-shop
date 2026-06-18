import jwt from 'jsonwebtoken';
import { authEnv } from './auth.env';
import type { AuthTokenPayload } from './auth.tokens';

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, authEnv.JWT_SECRET) as AuthTokenPayload & { iat: number; exp: number };
};
