'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { Lock, LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Credenciales hardcodeadas para admin
    if (formData.username === 'admin' && formData.password === 'admin') {
      // Guardar sesión de admin en localStorage
      localStorage.setItem('adminSession', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
    
    setIsLoading(false)
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
          <p className="text-neutral-400">Acceso para administradores</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              placeholder="Ingresa: admin"
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
              placeholder="Ingresa: admin"
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

        <div className="text-center mt-6">
          <p className="text-neutral-400 text-sm">
            <Link href="/" className="text-neutral-500 hover:text-foreground">
              ← Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}