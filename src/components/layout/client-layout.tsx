'use client'

import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import Navbar from './navbar'

interface ClientLayoutProps {
  user: User | null
  children: React.ReactNode
}

export default function ClientLayout({ user, children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Navbar user={user} />}
      {children}
    </>
  )
}