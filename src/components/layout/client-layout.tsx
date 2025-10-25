'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'

interface SerializedUser {
  id: string
  email?: string
  user_metadata?: any
  created_at: string
}

interface ClientLayoutProps {
  user: SerializedUser | null
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