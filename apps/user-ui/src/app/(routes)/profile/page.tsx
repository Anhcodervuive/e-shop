'use client';

import { useCurrentUser } from 'apps/user-ui/src/shared/hooks/use-current-user';
import Link from 'next/link';

const Page = () => {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <div className='w-full min-h-screen bg-[#f1f1f1] py-10'>
      <div className='w-[80%] mx-auto max-w-4xl bg-white rounded-2xl shadow p-8'>
        <h1 className='text-3xl font-semibold mb-4'>Profile</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className='space-y-2'>
            <p><span className='font-medium'>User ID:</span> {user.userId}</p>
            <p><span className='font-medium'>Email:</span> {user.email}</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <p>You are not logged in.</p>
            <Link href='/login' className='text-blue-500 hover:underline'>Go to login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
