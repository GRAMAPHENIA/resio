'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/services/auth.service'
import { User, LogOut, Calendar, LogIn, UserPlus, ChevronDown } from 'lucide-react'

export default function UserNav() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const authService = new AuthService()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
      setIsDropdownOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-neutral-800 animate-pulse rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/ingresar"
          className="flex items-center gap-2 text-neutral-300 hover:text-foreground transition-colors px-3 py-2"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Ingresar</span>
        </Link>
        <Link
          href="/registro"
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 hover:bg-neutral-200 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Registrarse</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 text-foreground hover:text-neutral-300 transition-colors px-3 py-2"
      >
        <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-background" />
        </div>
        <span className="hidden sm:inline max-w-32 truncate">
          {user.user_metadata?.full_name || user.email}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 shadow-lg z-20">
            <div className="p-4 border-b border-neutral-800">
              <p className="text-foreground font-medium truncate">
                {user.user_metadata?.full_name || 'Usuario'}
              </p>
              <p className="text-neutral-400 text-sm truncate">{user.email}</p>
            </div>
            
            <div className="py-2">
              <Link
                href="/mis-reservas"
                className="flex items-center gap-3 px-4 py-2 text-neutral-300 hover:text-foreground hover:bg-neutral-800 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Calendar className="w-4 h-4" />
                Mis Reservas
              </Link>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-neutral-300 hover:text-foreground hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}