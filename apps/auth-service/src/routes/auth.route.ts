import { Router } from 'express';
import { userRegistration } from '../controller/auth.controller';
import { validateRegisterPayload } from '../middleware/validate-register-payload.middleware';

const router = Router();

router.post('/register', validateRegisterPayload, userRegistration);

export default router;
