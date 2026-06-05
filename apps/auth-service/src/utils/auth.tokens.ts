import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AUTH_LIMITS } from './auth.constants';
import { authEnv } from './auth.env';

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

export const generateSessionId = () => crypto.randomUUID();

export const signAccessToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, authEnv.JWT_SECRET, {
    expiresIn: AUTH_LIMITS.ACCESS_TOKEN_EXPIRES_IN,
  });

export const signRefreshToken = (payload: AuthTokenPayload & { sessionId: string }) =>
  jwt.sign(payload, authEnv.JWT_REFRESH_SECRET, {
    expiresIn: AUTH_LIMITS.REFRESH_TOKEN_EXPIRES_IN,
  });

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, authEnv.JWT_REFRESH_SECRET) as AuthTokenPayload & { sessionId: string; iat: number; exp: number };
};
