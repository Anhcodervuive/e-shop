'use client'
import { AlignLeft, ChevronDown, Heart, ShoppingCart } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { navItems } from '../../configs/contants'
import Link from 'next/link'
import AccountEntry from '../components/account-entry'

const HeaderBottom = () => {
  const [show, setShow] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

//  Tracking scroll position
  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 100) {
            setIsSticky(true)
        } else {
            setIsSticky(false)
        }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
        window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return (
      <div className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-[100] bg-white shadow-lg h-[90px]' : 'relative h-[60px]'}`}>
        <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? 'pt-3' : 'py-0'}`}>
            {/* All Navigation */}
            <div className={`w-[260px] ${isSticky && '-mb-2'} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
                onClick={() => setShow(!show)}
            >
                <div className='flex items-center gap-2'>
                    <AlignLeft color='white'/>
                    <span className='text-white font-medium'>All departments</span>
                </div>
                <ChevronDown color='white' size={16}/>
            </div>

            {/* All dropdown */}
            {show && (
                <div className={`absolute left-0 ${isSticky ? 'top-[70px]' : 'top-[110%]'} w-[260px] h-[400px] bg-[#f5f5f5] shadow-lg rounded-md p-5`}>

                </div>
            )}

            {/* Navigation Links */}
            <div className='flex items-center gap-5'>
                {navItems.map((item: NavItemsTypes, index: number) => (
                    <Link key={index} href={item.href} className='px-5 font-medium text-lg text-gray-600 hover:text-gray-900 transition-colors duration-300'>
                        {item.title}
                    </Link>
                ))}
            </div>

            <div>
                {isSticky && (
                      <div className='flex items-center gap-8 '>
                          <AccountEntry />
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
                )}
            </div>
        </div>
    </div>
  )
}

export default HeaderBottom
