'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/logo'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Verificar credenciales de administrador
    if (formData.email === 'admin' && formData.password === 'admin') {
      // Guardar en localStorage para mantener sesión
      localStorage.setItem('admin_logged_in', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Credenciales incorrectas')
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
    <div className="min-h-screen bg-background" style={{ paddingTop: '0' }}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogIn className="w-6 h-6 text-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Panel de Administración</h2>
          </div>
          <p className="text-neutral-400">Acceso exclusivo para administradores</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Usuario
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              placeholder="admin"
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
              placeholder="admin"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-3 px-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Iniciando sesión...' : 'Acceder'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}