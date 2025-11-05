'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Footer from './footer'

interface SerializedUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: unknown
  }
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
      <main className="min-h-screen">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  )
}