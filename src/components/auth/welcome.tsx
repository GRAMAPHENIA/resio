'use client'

import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Plus, Calendar, TrendingUp, LayoutDashboard } from 'lucide-react'

interface WelcomeProps {
  user: User
}

export default function Welcome({ user }: WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl p-8 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ¡Bienvenido a RE/SIO!
          </h1>
          <p className="text-xl text-neutral-400 mb-2">
            Hola, {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-neutral-400">
            Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a gestionar tus propiedades en alquiler.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            ¿Qué puedes hacer en RE/SIO?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <Plus className="w-6 h-6 text-foreground mt-1" />
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Agregar Propiedades
                </h3>
                <p className="text-neutral-400 text-sm">
                  Publica tus propiedades con fotos, descripciones y precios
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-foreground mt-1" />
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Gestionar Reservas
                </h3>
                <p className="text-neutral-400 text-sm">
                  Administra las reservas y disponibilidad de tus propiedades
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-foreground mt-1" />
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Seguimiento
                </h3>
                <p className="text-neutral-400 text-sm">
                  Monitorea el rendimiento y estadísticas de tus alquileres
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/tablero"
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-lg font-medium hover:bg-neutral-200 transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
          Ir al Tablero
        </Link>
      </div>
    </div>
  )
}