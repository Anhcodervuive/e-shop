'use client';

import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type RequestFormData = {
  email: string;
};

type ResetFormData = {
  newPassword: string;
  confirmPassword: string;
};

type VerifyResetOtpResponse = {
  message: string;
  resetToken: string;
};

type ResetSession = {
  email: string;
  resetToken: string;
};

type ApiErrorDetails = Array<{ field: string; message: string }>;

const API_BASE = (process.env.NEXT_PUBLIC_SERVER_URI ?? '').replace(/\/$/, '');

const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
};

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSession, setResetSession] = useState<ResetSession | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmit,
    watch: watchRequest,
    formState: { errors: requestErrors },
  } = useForm<RequestFormData>();

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>();

  const email = watchRequest('email');
  const newPassword = watchReset('newPassword');

  useEffect(() => {
    if (step !== 2) {
      setOtp(['', '', '', '', '', '']);
    }
  }, [step]);

  useEffect(() => {
    if (step === 1) {
      setResetEmail('');
      setResetSession(null);
    }
  }, [step]);

  const requestResetMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await axios.post(`${API_BASE}/api/auth/forgot-password`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Password reset OTP has been sent');
      setStep(2);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to request password reset'));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post<VerifyResetOtpResponse>(`${API_BASE}/api/auth/verify-reset-otp`, {
        email: resetEmail || email,
        otp: otp.join(''),
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'OTP verified successfully');
      setResetSession({ email: resetEmail || email, resetToken: data.resetToken });
      setStep(3);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'OTP verification failed'));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetFormData) => {
      if (!resetSession) {
        throw new Error('Reset session expired');
      }

      const response = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email: resetSession.email,
        resetToken: resetSession.resetToken,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Password reset successfully');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to reset password'));
    },
  });

  const otpValue = useMemo(() => otp.join(''), [otp]);
  const canVerifyOtp = otpValue.length === 6 && !!(resetEmail || email);

  const onRequestSubmit = (data: RequestFormData) => {
    setResetEmail(data.email);
    requestResetMutation.mutate(data);
  };

  const onVerifyOtp = () => {
    if (!canVerifyOtp) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    verifyOtpMutation.mutate();
  };

  const onResetSubmit = (data: ResetFormData) => {
    if (!resetSession) {
      toast.error('Reset session expired. Please verify OTP again.');
      setStep(2);
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    resetPasswordMutation.mutate(data);
  };

  const resendOtp = () => {
    if (!resetEmail) {
      toast.error('Email is required to resend OTP');
      return;
    }

    requestResetMutation.mutate({ email: resetEmail });
  };

  return (
    <div className='w-full py-10 min-h-[140vh] bg-[#f1f1f1]'>
      <h1 className='text-4xl font-semibold font-Poppins text-black text-center'>Reset Password</h1>
      <p className='text-center text-lg font-medium py-3 text-[#00000099]'>Home . reset password</p>

      <div className='w-full flex justify-center'>
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
          <div className='flex items-center justify-between mb-6 text-sm font-medium'>
            <span className={step >= 1 ? 'text-blue-500' : 'text-gray-400'}>1. Request</span>
            <span className={step >= 2 ? 'text-blue-500' : 'text-gray-400'}>2. OTP</span>
            <span className={step >= 3 ? 'text-blue-500' : 'text-gray-400'}>3. New password</span>
          </div>

          {step === 1 && (
            <>
              <h3 className='text-3xl font-semibold text-center mb-2'>Request reset</h3>
              <p className='text-center text-gray-500 mb-4'>
                Enter your email to receive the OTP for password reset.
              </p>

              <form onSubmit={handleRequestSubmit(onRequestSubmit)} className='space-y-4'>
                <label className='block text-gray-700 mb-1'>Email:</label>
                <input
                  type='email'
                  {...registerRequest('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                  placeholder='Enter your email'
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${requestErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {requestErrors.email && (
                  <p className='text-red-500 text-sm mt-1'>{requestErrors.email.message}</p>
                )}

                <button
                  type='submit'
                  disabled={requestResetMutation.isPending}
                  className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {requestResetMutation.isPending ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className='text-3xl font-semibold text-center mb-2'>Enter OTP</h3>
              <p className='text-center text-gray-500 mb-4'>
                We sent a 6-digit code to <span className='font-medium text-gray-700'>{resetEmail}</span>.
              </p>

              <div className='flex justify-center gap-4 mb-4'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d$/.test(value) || value === '') {
                        const nextOtp = [...otp];
                        nextOtp[index] = value;
                        setOtp(nextOtp);

                        if (value && index < otp.length - 1) {
                          inputRefs.current[index + 1]?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    className='w-12 h-12 text-center text-xl border rounded-lg focus:outline-none border-gray-300'
                  />
                ))}
              </div>

              <div className='flex items-center justify-between gap-3'>
                <button
                  type='button'
                  onClick={() => setStep(1)}
                  className='text-sm text-gray-500 hover:underline'
                >
                  Change email
                </button>

                <button
                  type='button'
                  onClick={resendOtp}
                  disabled={requestResetMutation.isPending}
                  className='text-sm text-gray-500 hover:underline disabled:opacity-60'
                >
                  {requestResetMutation.isPending ? 'Resending...' : 'Resend OTP'}
                </button>

                <button
                  type='button'
                  onClick={onVerifyOtp}
                  disabled={verifyOtpMutation.isPending || !canVerifyOtp}
                  className='text-sm text-blue-500 hover:underline disabled:opacity-60'
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className='text-3xl font-semibold text-center mb-2'>Set new password</h3>
              <p className='text-center text-gray-500 mb-4'>
                Create a new password for <span className='font-medium text-gray-700'>{resetSession?.email ?? resetEmail}</span>.
              </p>

              <form onSubmit={handleResetSubmit(onResetSubmit)} className='space-y-4'>
                <label className='block text-gray-700 mb-1'>New password:</label>
                <div className='relative'>
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    {...registerReset('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    placeholder='Enter new password'
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${resetErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type='button'
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className='text-sm text-blue-500 hover:underline absolute right-3 top-1/2 transform -translate-y-1/2'
                  >
                    {passwordVisible ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                  {resetErrors.newPassword && (
                    <p className='text-red-500 text-sm mt-1'>{resetErrors.newPassword.message}</p>
                  )}
                </div>

                <label className='block text-gray-700 mb-1'>Confirm password:</label>
                <div className='relative'>
                  <input
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    {...registerReset('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === newPassword || 'Passwords do not match',
                    })}
                    placeholder='Re-enter new password'
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${resetErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type='button'
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className='text-sm text-blue-500 hover:underline absolute right-3 top-1/2 transform -translate-y-1/2'
                  >
                    {confirmPasswordVisible ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                  {resetErrors.confirmPassword && (
                    <p className='text-red-500 text-sm mt-1'>{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type='submit'
                  disabled={resetPasswordMutation.isPending}
                  className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {resetPasswordMutation.isPending ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}

          <p className='text-center text-sm text-gray-500 mt-4'>
            Back to{' '}
            <Link href='/login' className='text-blue-500 hover:underline'>
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
