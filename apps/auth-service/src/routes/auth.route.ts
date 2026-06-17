import { Router } from 'express';
import {
  forgotPasswordHandler,
  login,
  refreshToken,
  resetPasswordHandler,
  verifyResetOtpHandler,
  userRegistration,
  verifyUser,
} from '../controller/auth.controller';
import { validateRegisterPayload } from '../middleware/validate-register-payload.middleware';
import { validateVerifyOtpPayload } from '@auth/middleware/validate-verifyOtp-payload.middleware';
import {
  forgotPasswordPayloadSchema,
  loginPayloadSchema,
  resetPasswordPayloadSchema,
  verifyResetOtpPayloadSchema,
} from '@auth/schema';
import { createValidatePayloadMiddleware } from '../middleware/validate-payload.middleware';

const router = Router();

const validateLoginPayload = createValidatePayloadMiddleware(
  loginPayloadSchema,
  'Invalid login payload'
);
const validateForgotPasswordPayload = createValidatePayloadMiddleware(
  forgotPasswordPayloadSchema,
  'Invalid forgot password payload'
);
const validateResetPasswordPayload = createValidatePayloadMiddleware(
  resetPasswordPayloadSchema,
  'Invalid reset password payload'
);
const validateVerifyResetOtpPayload = createValidatePayloadMiddleware(
  verifyResetOtpPayloadSchema,
  'Invalid reset OTP payload'
);

/**
 * @swagger
 * /api/auth/register:
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
 * /api/auth/verify:
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Authenticates a verified user and returns access token plus refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginPayload'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or unverified account
 */
router.post('/login', validateLoginPayload, login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Rotates the refresh token and returns a new access token.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Refresh token is missing or invalid
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request password reset OTP
 *     description: Sends a password reset OTP to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordPayload'
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *       400:
 *         description: Invalid payload or user not eligible
 */
router.post('/forgot-password', validateForgotPasswordPayload, forgotPasswordHandler);

/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify password reset OTP
 *     description: Validates the reset OTP and marks the email as eligible to set a new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyResetOtpPayload'
 *     responses:
 *       200:
 *         description: OTP verified successfully and reset token issued
 *       400:
 *         description: Invalid payload or OTP
 */
router.post('/verify-reset-otp', validateVerifyResetOtpPayload, verifyResetOtpHandler);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password
 *     description: Updates the user's password after OTP verification is completed using the reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordPayload'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid payload or OTP verification missing
 */
router.post('/reset-password', validateResetPasswordPayload, resetPasswordHandler);

export default router;
