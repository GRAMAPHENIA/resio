'use client'

import { useState } from 'react'
import { BookingService, BookingWithProperty } from '@/services/booking.service'
import { Calendar, MapPin, CreditCard, Search, Eye, Download, Filter, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import BookingCalendar from '@/components/calendar/BookingCalendar'
import { CalendarEvent } from '@/services/calendar.service'

export default function MisReservasPage() {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const searchBookings = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Ingresa tu email')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const userBookings = await BookingService.getBookingsByUser(email.trim())
      setBookings(userBookings)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar reservas')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-900 text-green-300'
      case 'pending':
        return 'bg-yellow-900 text-yellow-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
              <p className="text-neutral-400 mt-2">Consulta tus reservas ingresando tu email</p>
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

        {/* Formulario de búsqueda */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 mb-8">
          <form onSubmit={searchBookings} className="flex gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa el email usado para reservar"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:bg-neutral-200 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

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
                      ? 'bg-blue-600 text-white'
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
                  <div className="mb-4 bg-blue-900/20 border border-blue-800 p-4">
                    <p className="text-blue-300 text-sm">
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
                            className="flex-1 bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 transition-colors text-center"
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
                          className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalles
                        </Link>
                        
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => {
                              window.location.href = `/reservas/detalle/${booking.id}`
                            }}
                            className="text-sm bg-yellow-600 text-white px-4 py-2 hover:bg-yellow-700 transition-colors"
                          >
                            Completar pago
                          </button>
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

        {/* Información adicional */}
        {!searched && (
          <div className="bg-blue-900/20 border border-blue-800 p-6 mb-8">
            <h3 className="text-blue-300 font-semibold mb-3">💡 ¿Sabías que puedes crear una cuenta?</h3>
            <p className="text-blue-200 mb-4">
              Con una cuenta de Resio puedes gestionar todas tus reservas de forma más fácil, recibir notificaciones automáticas y acceder a funciones exclusivas.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/ingresar"
                className="inline-flex items-center justify-center border border-blue-600 text-blue-300 px-6 py-3 hover:bg-blue-900/30 transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
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