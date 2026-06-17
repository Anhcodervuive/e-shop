'use client';

import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormData = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    verifiedAt: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

const API_BASE = (process.env.NEXT_PUBLIC_SERVER_URI ?? '').replace(/\/$/, '');

const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
};

const Page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post<LoginResponse>(`${API_BASE}/api/auth/login`, data, {
        withCredentials: true,
      });

      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Login successful');
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', variables.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      router.push('/');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Login failed'));
    },
  });

  const onSubmit = async (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className='w-full py-10 min-h-[140vh] bg-[#f1f1f1]'>
      <h1 className='text-4xl font-semibold font-Poppins text-black text-center'>Login</h1>
      <p className='text-center text-lg font-medium py-3 text-[#00000099]'>
        Home . login
      </p>

      <div className='w-full flex justify-center'>
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
          <h3 className='text-3xl font-semibold text-center mb-2'>Login to Eshop</h3>
          <p className='text-center text-gray-500 mb-4'>
            Don't have an account? {' '}
            <Link href={'/signup'} className='text-blue-500 hover:underline'>
              Sign up
            </Link>
          </p>

          <GoogleButton className='mt-2' />

          <div className='flex items-center my-5 text-gray-400 text-sm'>
            <div className='flex-1 border-t border-gray-300' />
            <span className='px-3'>Or Sign in with Email</span>
            <div className='flex-1 border-t border-gray-300' />
          </div>

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

            <label className='block text-gray-700 mb-1'>Password:</label>
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

            <div className='flex'>
              <label className='flex items-center mt-2 text-gray-600'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className='mr-2'
                />
                Remember me
              </label>
              <Link href={'/reset-password'} className='text-sm text-blue-500 hover:underline ml-auto mt-2'>
                Forgot password?
              </Link>
            </div>

            <button
              type='submit'
              disabled={loginMutation.isPending}
              className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
