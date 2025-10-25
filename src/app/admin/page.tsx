'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/spinner'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si ya está logueado como admin
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession === 'true') {
      router.push('/admin/dashboard')
    } else {
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Spinner className="text-foreground" />
        <p className="mt-4 text-neutral-400">Redirigiendo...</p>
      </div>
    </div>
  )
}