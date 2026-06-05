import { Router } from 'express';
import { userRegistration, verifyUser } from '../controller/auth.controller';
import { validateRegisterPayload } from '../middleware/validate-register-payload.middleware';
import { validateVerifyOtpPayload } from '@auth/middleware/validate-verifyOtp-payload.middleware';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account and sends an OTP email for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPayload'
 *     responses:
 *       200:
 *         description: Registration accepted and OTP email queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid payload or email already in use
 */
router.post('/register', validateRegisterPayload, userRegistration);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify a user with OTP
 *     description: Verifies the user account using the OTP sent by email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyUserPayload'
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid payload or OTP
 */
router.post('/verify', validateVerifyOtpPayload, verifyUser);

export default router;
