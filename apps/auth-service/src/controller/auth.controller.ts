import { tryCatch } from '@packages/error-handler';
import type { RegisterPayload } from '@auth/schema';
import { registerUser } from '@auth/services/auth.service';

// Register a new user
export const userRegistration = tryCatch(async (req, res) => {
  await registerUser(req.body as RegisterPayload);
  return res.status(200).json({
    message: 'Register payload validated successfully',
  });
});
