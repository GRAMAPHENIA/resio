'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import UserBookingsList from '@/presentation/components/booking/UserBookingsList'
import { useBooking } from '@/presentation/hooks/useBooking'
import { Calendar, Search, User, LogIn, Rocket, Lock, X } from 'lucide-react'
import Link from 'next/link'

export default function MisReservasPage() {
  const { user, loading: authLoading } = useAuth()
  const { getUserBookings, loading, error, clearError } = useBooking()
  const [email, setEmail] = useState('')
  const [bookingCode, setBookingCode] = useState('')
  const [bookings, setBookings] = useState<Array<{
    id: string;
    bookingCode: string;
    status: { value: string; display: string; color: string };
    dateRange: { formatted: string; nights: number };
    amount: number;
    createdAt: string;
    canCancel: boolean;
    canCompletePayment: boolean;
  }>>([])
  const [searched, setSearched] = useState(false)
  const [searchError, setSearchError] = useState('')

  const loadUserBookings = useCallback(async () => {
    if (!user?.email) return

    try {
      const userBookings = await getUserBookings({ email: user.email, userId: user.id })
      setBookings(userBookings)
      setSearched(true)
    } catch (err) {
      console.error('Error loading user bookings:', err)
    }
  }, [user?.email, user?.id, getUserBookings])

  // Cargar reservas automáticamente para usuarios autenticados
  useEffect(() => {
    if (user && user.email) {
      loadUserBookings()
    }
  }, [user, loadUserBookings])

  const searchBookings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')

    if (!email.trim()) {
      setSearchError('Ingresa tu email')
      return
    }

    if (!bookingCode.trim()) {
      setSearchError('Ingresa el código de reserva')
      return
    }

    if (bookingCode.trim().length !== 8) {
      setSearchError('El código de reserva debe tener 8 caracteres')
      return
    }

    try {
      // Para búsqueda pública, usamos solo el email
      // El código se usa para validación de seguridad
      const userBookings = await getUserBookings({ email: email.trim() })
      
      // Verificar que al menos una reserva coincida con el código
      const hasMatchingCode = userBookings.some(booking => 
        booking.bookingCode.toLowerCase() === bookingCode.trim().toLowerCase()
      )

      if (!hasMatchingCode && userBookings.length > 0) {
        setSearchError('Código de reserva incorrecto para este email')
        return
      }

      setBookings(userBookings)
      setSearched(true)
    } catch {
      setSearchError('Email o código de reserva incorrectos')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-neutral-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
              {user ? (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-green-500" />
                  <p className="text-green-400">Bienvenido, {user.user_metadata?.full_name || user.email}</p>
                </div>
              ) : (
                <p className="text-neutral-400 mt-2">Consulta tus reservas ingresando tu email</p>
              )}
            </div>
          </div>
        </div>

        {/* Usuario autenticado - mostrar sus reservas automáticamente */}
        {user ? (
          <div>
            {loading && !searched ? (
              <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
                <p className="text-neutral-400">Cargando tus reservas...</p>
              </div>
            ) : searched ? (
              <UserBookingsList email={user.email} userId={user.id} />
            ) : null}
          </div>
        ) : (
          /* Usuario no autenticado - mostrar formulario de búsqueda */
          <>
            {/* Promoción de registro */}
            <div className="bg-blue-900/20 border border-blue-500 p-6 mb-6">
              <h3 className="text-blue-400 font-semibold mb-3">
                <Rocket className="w-5 h-5 inline mr-2" /> 
                ¡Accede más fácil con tu cuenta!
              </h3>
              <p className="text-blue-300 mb-4">
                Si tienes una cuenta de RE/SIO, puedes ver todas tus reservas automáticamente sin necesidad de códigos.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <Link
                  href="/ingresar"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center justify-center border border-blue-500 text-blue-400 px-6 py-3 hover:bg-blue-900/30 transition-colors"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            </div>

            {/* Formulario de búsqueda */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8">
              <div className="mb-4">
                <h3 className="text-foreground font-semibold mb-2">Buscar mis reservas</h3>
                <p className="text-neutral-400 text-sm">
                  Por seguridad, necesitas tanto tu email como el código de una de tus reservas
                </p>
              </div>
          
              <form onSubmit={searchBookings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email usado para reservar
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Código de reserva
                    </label>
                    <input
                      type="text"
                      value={bookingCode}
                      onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                      placeholder="ABC12345"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500 font-mono"
                      maxLength={8}
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Código de 8 caracteres que aparece en tu email de confirmación
                    </p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:bg-neutral-200 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Verificando...' : 'Buscar reservas'}
                </button>
              </form>
              
              {/* Información sobre el código */}
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500">
                <h4 className="text-blue-400 font-medium mb-2">¿Dónde encuentro mi código de reserva?</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• En el email de confirmación que recibiste</li>
                  <li>• En la página de éxito después de pagar</li>
                  <li>• En cualquier comunicación sobre tu reserva</li>
                </ul>
              </div>
            </div>

            {/* Mensaje de seguridad */}
            <div className="bg-green-900/20 border border-green-500 p-6 mb-6">
              <h3 className="text-green-400 font-semibold mb-3">
                <Lock className="w-5 h-5 inline mr-2" /> 
                Tu privacidad es importante
              </h3>
              <p className="text-green-300 mb-2">
                Para proteger tus datos, ahora necesitas tanto tu email como el código de reserva para acceder a tu información.
              </p>
              <p className="text-green-300 text-sm">
                Esto evita que otras personas puedan ver tus reservas solo conociendo tu email.
              </p>
            </div>
          </>
        )}

        {/* Errores de búsqueda */}
        {searchError && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 mb-6 flex items-center justify-between">
            <span>{searchError}</span>
            <button
              onClick={() => setSearchError('')}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Errores de la API */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resultados para usuarios no autenticados */}
        {!user && searched && (
          <div>
            {bookings.length > 0 ? (
              <div>
                <div className="mb-4 bg-blue-900/20 border border-blue-500 p-4">
                  <p className="text-blue-300 text-sm">
                    📅 Mostrando reservas para <strong>{email}</strong>
                  </p>
                </div>
                <UserBookingsList email={email} showFilters={true} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron reservas</h3>
                <p className="text-neutral-400 mb-4">No hay reservas asociadas a este email.</p>
                <Link
                  href="/"
                  className="inline-block bg-foreground text-background px-6 py-2 hover:bg-neutral-200 transition-colors font-medium"
                >
                  Ver alojamientos disponibles
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de bienvenida para usuarios autenticados sin reservas */}
        {user && searched && bookings.length === 0 && (
          <div className="bg-blue-900/20 border border-blue-500 p-6 mb-8">
            <h3 className="text-blue-400 font-semibold mb-3">👋 ¡Bienvenido a RE/SIO!</h3>
            <p className="text-blue-300 mb-4">
              Aún no tienes reservas en tu cuenta. Cuando hagas tu primera reserva, aparecerá aquí automáticamente.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
            >
              Explorar alojamientos
            </Link>
          </div>
        )}

        {/* Ayuda */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8">
          <h3 className="text-foreground font-semibold mb-3">¿Necesitas ayuda?</h3>
          <p className="text-neutral-300 mb-4">
            Si tienes problemas para encontrar tu reserva o necesitas asistencia, estamos aquí para ayudarte.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <Link
              href="/ayuda"
              className="inline-flex items-center justify-center bg-neutral-700 text-neutral-300 px-6 py-3 hover:bg-neutral-600 transition-colors"
            >
              Centro de Ayuda
            </Link>
            <a
              href="mailto:soporte@resio.com"
              className="inline-flex items-center justify-center border border-neutral-700 text-neutral-300 px-6 py-3 hover:bg-neutral-800 transition-colors"
            >
              Contactar Soporte
            </a>
          </div>
        </div>

        {/* Volver al inicio */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-neutral-400 hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}