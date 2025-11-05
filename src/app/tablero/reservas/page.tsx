'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import UserBookingsList from '@/presentation/components/booking/UserBookingsList'
import { AlertCircle } from 'lucide-react'

export default function ReservasPage() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
    } else {
      setError('Debes iniciar sesión para ver tus reservas')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-neutral-400">Verificando usuario...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Acceso Requerido</h2>
          <p className="text-neutral-400 mb-6">{error || 'Debes iniciar sesión para continuar'}</p>
          <a
            href="/ingresar"
            className="inline-block bg-foreground text-background px-6 py-3 hover:bg-neutral-200 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserBookingsList userId={user.id} email={user.email} />
      </div>
    </div>
  )
}