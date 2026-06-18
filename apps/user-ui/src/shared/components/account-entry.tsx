'use client';

import Link from 'next/link';
import { Loader2, LogOut, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../hooks/use-current-user';
import { apiClient } from '../lib/api';
import { useRouter } from 'next/navigation';

const AccountEntry = () => {
  const { data: user, isLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/auth/logout');
      return response.data as { message?: string };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['current-user'] });
      router.push('/login');
      router.refresh();
    },
  });

  if (isLoading) {
    return (
      <div className='flex items-center gap-2'>
        <div className='border-2 w-[50px] h-[50px] rounded-full flex items-center justify-center border-[#010f1c1a] animate-pulse' />
        <div className='space-y-1'>
          <div className='h-4 w-16 bg-slate-200 rounded animate-pulse' />
          <div className='h-4 w-20 bg-slate-200 rounded animate-pulse' />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <Link href='/profile' className='border-2 w-[50px] h-[50px] rounded-full flex items-center justify-center border-[#010f1c1a]'>
            <User />
          </Link>
          <Link href='/profile'>
            <span className='block font-medium'>Hello,</span>
            <span className='font-semibold'>{user.name}</span>
          </Link>
        </div>
        <button
          type='button'
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60'
        >
          {logoutMutation.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <LogOut className='h-4 w-4' />
          )}
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <Link href='/login' className='border-2 w-[50px] h-[50px] rounded-full flex items-center justify-center border-[#010f1c1a]'>
        <User />
      </Link>
      <Link href='/login'>
        <span className='block font-medium'>Hello,</span>
        <span className='font-semibold'>Sign in</span>
      </Link>
    </div>
  );
};

export default AccountEntry;
