import type { RegisterPayload } from '../schema';
import { registerUser } from '../services/auth.service';
import { tryCatch } from '../../../../packages/error-handler';

// Register a new user
export const userRegistration = tryCatch(async (req, res) => {
  await registerUser(req.body as RegisterPayload);
  return res.status(200).json({
    message: 'Register payload validated successfully',
  });
});
