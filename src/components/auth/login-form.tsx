'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { AuthService } from '@/services/auth.service'
import { LogIn, Lock, ArrowLeft } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const authService = new AuthService()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await authService.signInWithEmail(formData.email, formData.password)
      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      const err = error as Error
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Administración</h2>
          </div>
          <p className="text-neutral-400">Acceso para administradores de RESIO Alojamientos</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-dark border border-error text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-3 px-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>





        <div className="text-center">
          <p className="text-neutral-400 text-sm">
            <Link href="/" className="inline-flex items-center gap-1 text-neutral-500 hover:text-foreground">
              <ArrowLeft className="w-3 h-3" />
              Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}