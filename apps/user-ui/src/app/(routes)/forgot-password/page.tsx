'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient, isAxiosError } from 'apps/user-ui/src/shared/lib/api';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormData = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
};

const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (!isAxiosError(error)) {
    return fallback;
  }

  return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
};

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Password reset email sent');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to send reset email'));
    },
  });

  const onSubmit = async (data: FormData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className='w-full py-10 min-h-[140vh] bg-[#f1f1f1]'>
      <h1 className='text-4xl font-semibold font-Poppins text-black text-center'>Forgot Password</h1>
      <p className='text-center text-lg font-medium py-3 text-[#00000099]'>Home . forgot password</p>

      <div className='w-full flex justify-center'>
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
          <h3 className='text-3xl font-semibold text-center mb-2'>Reset your password</h3>
          <p className='text-center text-gray-500 mb-4'>
            Enter your email and we will send you a password reset link or OTP.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <label className='block text-gray-700 mb-1'>Email:</label>
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

            <button
              type='submit'
              disabled={forgotPasswordMutation.isPending}
              className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Submit'}
            </button>
          </form>

          <p className='text-center text-sm text-gray-500 mt-4'>
            Remember your password?{' '}
            <Link href='/reset-password' className='text-blue-500 hover:underline'>
              Continue reset flow
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
