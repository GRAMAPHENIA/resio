'use client'

import { useState } from 'react'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { AuthService } from '@/services/auth.service'
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react'

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
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
      window.location.href = '/'
    } catch (error: unknown) {
      const err = error as Error
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError('')
    
    try {
      await authService.signInWithGoogle('/')
    } catch (error: unknown) {
      setError('Error al iniciar sesión con Google')
    } finally {
      setIsGoogleLoading(false)
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
            <LogIn className="w-6 h-6 text-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Iniciar sesión</h2>
          </div>
          <p className="text-neutral-400">Accede a tu cuenta de RE/SIO</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 text-sm">
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

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-neutral-400">o</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full border border-neutral-800 text-foreground py-3 px-4 font-medium hover:bg-neutral-900 transition-colors disabled:opacity-50 mb-6"
        >
          {isGoogleLoading ? 'Cargando...' : 'Iniciar sesión con Google'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-neutral-400 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-foreground hover:underline">
              Regístrate
            </Link>
          </p>
          <p className="text-neutral-400 text-sm">
            <Link href="/" className="inline-flex items-center gap-1 text-neutral-500 hover:text-foreground">
              <ArrowLeft className="w-3 h-3" />
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}