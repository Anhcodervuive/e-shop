import Link from 'next/link'
import React from 'react'
import { Heart, Search, ShoppingCart, User } from 'lucide-react'
import HeaderBottom from './header-bottom'

const Header = () => {
  return (
    <div className='w-full bg-white'>
        <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
            <div>
                <Link href='/'>
                      <span className='text-xl font-[400]'>Eshop</span>
                </Link>
            </div>
            <div className='w-[50%] relative'>
              <input type='text' placeholder='Search for products...' className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]' />
              <div className='w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0'>
                <Search color='white'/>
              </div>
              
            </div>
            <div className='flex items-center gap-8 '>
              <div className='flex items-center gap-2'>
                <Link href={'/login'} className='border-2 w-[50px] h-[50px] rounded-full flex items-center justify-center border-[#010f1c1a]'>
                  <User />
                </Link>
                <Link href={'/login'}>
                  <span className='block font-medium'>Hello,</span>
                  <span className='font-semibold'>Sign in</span>
                </Link>
              </div>
              <div className='flex items-center gap-5'>
                <Link href={'/wishList'} className='relative'>
                  <Heart />
                  <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-xs font-bold text-white'>0</span>
                  </div>
                </Link>
                <Link href={'/cart'} className='relative'>
                  <ShoppingCart />
                  <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-xs font-bold text-white'>0</span>
                  </div>
                </Link>
              </div>
            </div>
        </div>
        <div className='border-b border-b-slate-200' />
        <HeaderBottom />
    </div>
  )
}

export default Header