'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { AuthService } from '@/services/auth.service'
import { Calendar, Heart, LogOut, ChevronDown, Home } from 'lucide-react'
import Image from 'next/image'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const authService = new AuthService()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="border-b border-neutral-800 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/favoritos"
              className="flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors"
            >
              <Heart className="w-4 h-4" />
              Favoritos
            </Link>
            
            <Link
              href="/mis-reservas"
              className="flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Mis Reservas
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/propiedades"
                  className="flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Administrar
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-neutral-400 hover:text-foreground transition-colors"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <div className="w-8 h-8 bg-neutral-700 rounded-full relative overflow-hidden">
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-foreground text-sm font-medium">
                          {(user.user_metadata?.full_name || user.email || '').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-neutral-400 border-b border-neutral-800">
                          {user.user_metadata?.full_name || user.email}
                        </div>
                        <Link
                          href="/tablero/reservas"
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
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}