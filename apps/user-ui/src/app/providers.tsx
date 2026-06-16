'use client'

import React, { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const Providers = ({ children } : { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors closeButton />
        {children}
    </QueryClientProvider>
  )
}

export default Providers
