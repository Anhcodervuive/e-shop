'use client';

import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import GoogleButton from 'apps/user-ui/src/shared/components/google-button';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>();

  const email = watch('email');
  const passwordValue = watch('password');

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!showOtp) {
      setOtp(['', '', '', '', '', '']);
    }
  }, [showOtp]);

  const applyServerFieldErrors = (details?: ApiErrorDetails) => {
    if (!details?.length) {
      return false;
    }

    details.forEach(({ field, message }) => {
      if (field === 'email') {
        setError('email', { type: 'server', message });
      }

      if (field === 'name') {
        setError('name', { type: 'server', message });
      }

      if (field === 'password') {
        setError('password', { type: 'server', message });
      }

      if (field === 'confirmPassword') {
        setError('confirmPassword', { type: 'server', message });
      }
    });

    return true;
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${API_BASE}/api/auth/register`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('OTP has been sent to your email');
      setShowOtp(true);
      setCanResend(false);
      setResendTimer(60);
      startResendTimer();
    },
    onError: (error) => {
      const responseData = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string; details?: ApiErrorDetails } | undefined)
        : undefined;

      if (applyServerFieldErrors(responseData?.details)) {
        toast.error(responseData?.message ?? 'Please check the highlighted fields');
        return;
      }

      toast.error(getApiErrorMessage(error, 'Failed to create account'));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_BASE}/api/auth/verify`, {
        email,
        otp: otp.join(''),
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success('Account verified successfully');
      router.push('/login');
    },
    onError: (error) => {
      const responseData = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string; details?: ApiErrorDetails } | undefined)
        : undefined;

      if (responseData?.details?.length) {
        const otpErrors = responseData.details.filter(({ field }) => field === 'otp' || field === 'email');

        if (otpErrors.length) {
          toast.error(responseData.message ?? 'OTP verification failed');
          return;
        }
      }

      toast.error(getApiErrorMessage(error, 'OTP verification failed'));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: watch('name'),
        email,
        password: watch('password'),
        confirmPassword: watch('confirmPassword'),
      };

      const response = await axios.post(`${API_BASE}/api/auth/register`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('A new OTP has been sent');
      setCanResend(false);
      setResendTimer(60);
      startResendTimer();
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to resend OTP');
      toast.error(message);
    },
  });

  const onSubmit = async (data: FormData) => {
    clearErrors();
    signupMutation.mutate(data);
  };

  const otpValue = useMemo(() => otp.join(''), [otp]);

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    verifyOtpMutation.mutate();
  };

  const resendOtp = () => {
    if (!email) {
      toast.error('Email is required to resend OTP');
      return;
    }

    resendOtpMutation.mutate();
  };

  return (
    <div className='w-full py-10 min-h-[140vh] bg-[#f1f1f1]'>
      <h1 className='text-4xl font-semibold font-Poppins text-black text-center'>Sign up</h1>
      <p className='text-center text-lg font-medium py-3 text-[#00000099]'>
        Home . signup
      </p>

      <div className='w-full flex justify-center'>
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
          <h3 className='text-3xl font-semibold text-center mb-2'>Create your account</h3>
          <p className='text-center text-gray-500 mb-4'>
            Already have an account? {' '}
            <Link href={'/login'} className='text-blue-500 hover:underline'>
              Login
            </Link>
          </p>

          <GoogleButton className='mt-2' />

          <div className='flex items-center my-5 text-gray-400 text-sm'>
            <div className='flex-1 border-t border-gray-300' />
            <span className='px-3'>Or Sign up with Email</span>
            <div className='flex-1 border-t border-gray-300' />
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <label className='block text-gray-700 mb-1'>Name: </label>
              <input
                type='text'
                {...register('name', { required: 'Name is required' })}
                placeholder='Enter your name'
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}

              <label className='block text-gray-700 mb-1'>Email: </label>
              <input
                type='email'
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
                placeholder='Enter your email'
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}

              <label className='block text-gray-700 mb-1'>Password: </label>
              <div className='relative'>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  placeholder='Enter your password'
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type='button'
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className='text-sm text-blue-500 hover:underline absolute right-3 top-1/2 transform -translate-y-1/2'
                >
                  {passwordVisible ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
                {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
              </div>

              <label className='block text-gray-700 mb-1'>Confirm Password: </label>
              <div className='relative'>
                <input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === passwordValue || 'Passwords do not match',
                  })}
                  placeholder='Re-enter your password'
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type='button'
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  className='text-sm text-blue-500 hover:underline absolute right-3 top-1/2 transform -translate-y-1/2'
                >
                  {confirmPasswordVisible ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
                {errors.confirmPassword && (
                  <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type='submit'
                disabled={signupMutation.isPending}
                className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {signupMutation.isPending ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <div>
              <h3 className='text-xl font-semibold text-center mb-4'>Enter OTP</h3>
              <div className='flex justify-center gap-6'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type='text'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d$/.test(value) || value === '') {
                        const newOtp = [...otp];
                        newOtp[index] = value;
                        setOtp(newOtp);

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
                      if (el) {
                        inputRefs.current[index] = el;
                      }
                    }}
                    className='w-12 h-12 text-center text-xl border rounded-lg focus:outline-none'
                  />
                ))}
              </div>

              <div className='flex justify-between mt-4'>
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    disabled={resendOtpMutation.isPending}
                    className='text-sm text-gray-500 hover:underline disabled:opacity-60'
                  >
                    {resendOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
                  </button>
                ) : (
                  <p className='text-sm'>Resend OTP in {resendTimer}</p>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending}
                  className='text-sm text-blue-500 hover:underline disabled:opacity-60'
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
