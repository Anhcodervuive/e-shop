import { tryCatch } from '@packages/error-handler';
import type { RegisterPayload } from '@auth/schema';
import { registerUser, verifyUser as verifyUserService } from '@auth/services/auth.service';
import type { Request, Response } from 'express';

// Register a new user
export const userRegistration = tryCatch(async (req: Request, res: Response) => {
  await registerUser(req.body as RegisterPayload);
  return res.status(200).json({
    message: 'Register payload validated successfully',
  });
});

export const verifyUser = tryCatch(async (req: Request, res: Response) => {
  const { message, user } = await verifyUserService(req.body.email, req.body.otp);
  return res.status(200).json({
    message,
    user,
  });
});