'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-neutral-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Página no encontrada
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:bg-neutral-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-neutral-800 text-foreground px-6 py-3 font-medium hover:bg-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}