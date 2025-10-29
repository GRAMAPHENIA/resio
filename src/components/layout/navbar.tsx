'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { AuthService } from '@/services/auth.service'
import { Calendar, Heart, LogOut, ChevronDown, Home, EllipsisVertical, LogIn, UserPlus } from 'lucide-react'
import Image from 'next/image'

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

interface NavbarProps {
  user: SerializedUser | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const authService = new AuthService()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-neutral-400 hover:text-foreground transition-colors"
                  >
                    {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                      <div className="w-8 h-8 bg-neutral-700 rounded-full relative overflow-hidden">
                        <Image
                          src={user.user_metadata.avatar_url || user.user_metadata.picture as string}
                          alt="Avatar"
                          fill
                          className="object-cover"
                          sizes="32px"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-foreground text-sm font-medium">${(user.user_metadata?.full_name || user.user_metadata?.name || user.email || '').toString().charAt(0).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-foreground text-sm font-medium">
                          {(user.user_metadata?.full_name || user.user_metadata?.name || user.email || '').toString().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="hidden md:inline text-sm max-w-32 truncate">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-neutral-400 border-b border-neutral-800">
                          {user.user_metadata?.full_name || user.email}
                        </div>
                        <Link
                          href="/mis-reservas"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-foreground transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Calendar className="w-4 h-4" />
                          Mis Reservas
                        </Link>
                        <Link
                          href="/favoritos"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-foreground transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          Favoritos
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-foreground transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Botones para usuarios no autenticados
              <>
                <div className="flex items-center gap-2">
                  <Link
                    href="/ingresar"
                    className="flex items-center justify-center w-8 h-8 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-foreground transition-colors"
                    title="Iniciar sesión"
                  >
                    <LogIn className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/registro"
                    className="flex items-center justify-center w-8 h-8 bg-foreground text-background hover:bg-neutral-200 transition-colors"
                    title="Registrarse"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Link>
                </div>

                {/* Menu Button - Después de los botones de autenticación */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center justify-center w-8 h-8 bg-neutral-900 border border-neutral-800 text-foreground hover:opacity-70 transition-opacity"
                  >
                    <EllipsisVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMobileMenuOpen && (
                    <div className="absolute right-0 mt-4 w-50 bg-neutral-900 border border-neutral-800 shadow-lg z-50">
                      <div className="py-4">
                        <Link
                          href="/favoritos"
                          className="flex items-center gap-3 px-4 py-2 text-neutral-400 hover:text-foreground hover:bg-neutral-800 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          Favoritos
                        </Link>

                        <Link
                          href="/mis-reservas"
                          className="flex items-center gap-3 px-4 py-2 text-neutral-400 hover:text-foreground hover:bg-neutral-800 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Calendar className="w-4 h-4" />
                          Mis Reservas
                        </Link>

                        <div className="border-t border-neutral-800 my-2"></div>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-foreground transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>

                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>


      </div>
    </nav>
  )
}