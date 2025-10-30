'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookingService, BookingWithProperty } from '@/services/booking.service'
import { Calendar, MapPin, CreditCard, Search, Eye, Download, Filter, CalendarDays, User, LogIn, Rocket, Lock, X } from 'lucide-react'
import Link from 'next/link'
import BookingCalendar from '@/components/calendar/BookingCalendar'
import { CalendarEvent } from '@/services/calendar.service'
import { useAuth } from '@/hooks/useAuth'

export default function MisReservasPage() {
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [bookingCode, setBookingCode] = useState('')
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null)

  const loadUserBookings = useCallback(async () => {
    if (!user?.email) return

    setLoading(true)
    setError('')

    try {
      const userBookings = await BookingService.getBookingsByEmail(user.email, user.id)
      setBookings(userBookings)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus reservas')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Cargar reservas automáticamente para usuarios autenticados
  useEffect(() => {
    if (user && user.email) {
      loadUserBookings()
    }
  }, [user, loadUserBookings])

  const searchBookings = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Ingresa tu email')
      return
    }

    if (!bookingCode.trim()) {
      setError('Ingresa el código de reserva')
      return
    }

    if (bookingCode.trim().length !== 8) {
      setError('El código de reserva debe tener 8 caracteres')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verificar que existe una reserva con ese email y código
      const userBookings = await BookingService.getBookingsByUserAndCode(email.trim(), bookingCode.trim())
      setBookings(userBookings)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email o código de reserva incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.')) {
      return
    }

    setCancellingBooking(bookingId)
    try {
      await BookingService.cancelBooking(bookingId)

      // Actualizar la lista de reservas
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ))

      alert('Reserva cancelada exitosamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la reserva')
    } finally {
      setCancellingBooking(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success-dark text-success'
      case 'pending':
        return 'bg-warning-dark text-warning'
      case 'cancelled':
        return 'bg-error-dark text-error'
      default:
        return 'bg-neutral-700 text-neutral-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
              {user ? (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-success" />
                  <p className="text-success">Bienvenido, {user.user_metadata?.full_name || user.email}</p>
                </div>
              ) : (
                <p className="text-neutral-400 mt-2">Consulta tus reservas ingresando tu email</p>
              )}
            </div>
            
            {searched && bookings.length > 0 && (
              <div className="mt-4 md:mt-0 flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-foreground text-background'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-foreground text-background'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  Calendario
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mostrar diferentes contenidos según el estado de autenticación */}
        {user ? (
          // Usuario autenticado - mostrar sus reservas automáticamente
          loading && !searched ? (
            <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
              <p className="text-neutral-400">Cargando tus reservas...</p>
            </div>
          ) : null
        ) : (
          // Usuario no autenticado - mostrar formulario de búsqueda
          <>
            <div className="bg-info-dark/20 border border-info p-6 mb-6">
              <h3 className="text-info font-semibold mb-3"><Rocket className="w-5 h-5 inline mr-2" /> ¡Accede más fácil con tu cuenta!</h3>
              <p className="text-info mb-4">
                Si tienes una cuenta de Resio, puedes ver todas tus reservas automáticamente sin necesidad de códigos.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <Link
                  href="/ingresar"
                  className="inline-flex items-center justify-center gap-2 bg-info text-background px-6 py-3 hover:bg-info-dark transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center justify-center border border-info text-info px-6 py-3 hover:bg-info-dark/30 transition-colors"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            </div>

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
          
              <div className="mt-4 p-4 bg-info-dark/20 border border-info">
                <h4 className="text-info font-medium mb-2">¿Dónde encuentro mi código de reserva?</h4>
                <ul className="text-info text-sm space-y-1">
                  <li>• En el email de confirmación que recibiste</li>
                  <li>• En la página de éxito después de pagar</li>
                  <li>• En cualquier comunicación sobre tu reserva</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Filtros */}
        {searched && bookings.length > 0 && viewMode === 'list' && (
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-400">Filtrar por estado:</span>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'paid', label: 'Confirmadas' },
                { key: 'pending', label: 'Pendientes' },
                { key: 'cancelled', label: 'Canceladas' }
              ].map(({ key, label }: { key: string; label: string }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key as 'all' | 'paid' | 'pending' | 'cancelled')}
                  className={`px-3 py-1 text-sm transition-colors ${
                    filterStatus === key
                      ? 'bg-info text-background'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {searched && (
          <>
            {bookings.length > 0 ? (
              viewMode === 'calendar' ? (
                <div>
                  <div className="mb-4 bg-info-dark/20 border border-info p-4">
                    <p className="text-info text-sm">
                      📅 Vista de calendario mostrando tus reservas para <strong>{email}</strong>
                    </p>
                  </div>
                  
                  <BookingCalendar 
                    onEventClick={(event) => setSelectedEvent(event)}
                  />
                  
                  {/* Modal de detalles del evento */}
                  {selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Detalles de la Reserva
                        </h3>
                        
                        <div className="space-y-3 mb-6">
                          <div>
                            <p className="text-sm text-neutral-400">Propiedad</p>
                            <p className="text-foreground">{selectedEvent.property_name}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-neutral-400">Huésped</p>
                            <p className="text-foreground">{selectedEvent.guest_name}</p>
                            <p className="text-sm text-neutral-300">{selectedEvent.guest_email}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-neutral-400">Entrada</p>
                              <p className="text-foreground">
                                {new Date(selectedEvent.start).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-400">Salida</p>
                              <p className="text-foreground">
                                {new Date(selectedEvent.end).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-neutral-400">Total</p>
                            <p className="text-foreground text-lg font-semibold">
                              ${selectedEvent.amount.toLocaleString('es-AR')}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-neutral-400">Estado</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                              selectedEvent.status === 'confirmed' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-yellow-900 text-yellow-300'
                            }`}>
                              {selectedEvent.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            href={`/reservas/detalle/${selectedEvent.id}`}
                            className="flex-1 bg-info text-background py-2 px-4 hover:bg-info-dark transition-colors text-center"
                          >
                            Ver detalles
                          </Link>
                          <button
                            onClick={() => setSelectedEvent(null)}
                            className="flex-1 bg-neutral-800 text-neutral-300 py-2 px-4 hover:bg-neutral-700 transition-colors"
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings
                    .filter(booking => filterStatus === 'all' || booking.status === filterStatus)
                    .map((booking) => (
                  <div key={booking.id} className="bg-neutral-900 border border-neutral-800 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {booking.property.name}
                        </h3>
                        <div className="flex items-center text-neutral-400 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.property.location}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`inline-block px-3 py-1 text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-400">Entrada</p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.start_date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Salida</p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.end_date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Total</p>
                        <p className="font-medium text-lg text-foreground">${booking.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                      <div className="text-sm text-neutral-400">
                        Reservado el {new Date(booking.created_at).toLocaleDateString('es-ES')}
                        {booking.payment_id && (
                          <span className="ml-2 flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            ID: {booking.payment_id}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/reservas/detalle/${booking.id}`}
                          className="flex items-center gap-2 text-sm bg-info text-background px-4 py-2 hover:bg-info-dark transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalles
                        </Link>
                        
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                window.location.href = `/reservas/detalle/${booking.id}`
                              }}
                              className="text-sm bg-warning text-background px-4 py-2 hover:bg-warning-dark transition-colors"
                            >
                              Completar pago
                            </button>

                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingBooking === booking.id}
                              className="flex items-center gap-2 text-sm bg-error text-background px-4 py-2 hover:bg-error-dark transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                              {cancellingBooking === booking.id ? 'Cancelando...' : 'Cancelar'}
                            </button>
                          </>
                        )}

                        {booking.status === 'paid' && (
                          <button
                            onClick={() => {
                              alert('Funcionalidad de descarga próximamente')
                            }}
                            className="flex items-center gap-2 text-sm bg-neutral-700 text-neutral-300 px-4 py-2 hover:bg-neutral-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        )}
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              )
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
          </>
        )}

        {/* Información adicional para usuarios no autenticados */}
        {!user && !searched && (
          <>
            <div className="bg-success-dark/20 border border-success p-6 mb-6">
              <h3 className="text-success font-semibold mb-3"><Lock className="w-5 h-5 inline mr-2" /> Tu privacidad es importante</h3>
              <p className="text-success mb-2">
                Para proteger tus datos, ahora necesitas tanto tu email como el código de reserva para acceder a tu información.
              </p>
              <p className="text-success text-sm">
                Esto evita que otras personas puedan ver tus reservas solo conociendo tu email.
              </p>
            </div>
          </>
        )}

        {/* Mensaje de bienvenida para usuarios autenticados sin reservas */}
        {user && searched && bookings.length === 0 && (
          <div className="bg-info-dark/20 border border-info p-6 mb-8">
            <h3 className="text-info font-semibold mb-3">👋 ¡Bienvenido a Resio!</h3>
            <p className="text-info mb-4">
              Aún no tienes reservas en tu cuenta. Cuando hagas tu primera reserva, aparecerá aquí automáticamente.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-info text-background px-6 py-3 hover:bg-info-dark transition-colors"
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