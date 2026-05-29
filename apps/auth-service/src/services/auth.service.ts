import { BadRequestError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import type { RegisterPayload } from '@auth/schema';
import { sendOtp } from '@auth/utils/auth.helper';

export const registerUser = async (payload: RegisterPayload) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email }
    })

    if(existingUser) {
        throw new BadRequestError('Email already in use');
    }

    // await checkOtpRestriction(payload.email);
    // await trackOtpRequest(payload.email);
    await sendOtp(payload.name, payload.email, 'user-activation-mail');

    return { message: 'Registration successful. Please check your email for the OTP to activate your account.' }
}
