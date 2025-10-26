'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { BookingService, BookingWithProperty } from '@/services/booking.service'
import { Calendar, MapPin, CreditCard, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import Spinner from '@/components/ui/spinner'
import BookingCalendar from '@/components/calendar/BookingCalendar'
import { CalendarEvent } from '@/services/calendar.service'

export default function ReservasPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const loadBookings = useCallback(async () => {
    if (!user?.email) return
    
    try {
      setLoading(true)
      const userBookings = await BookingService.getBookingsByUser(user.email)
      setBookings(userBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-900 text-green-300'
      case 'pending':
        return 'bg-yellow-900 text-yellow-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
      default:
        return 'bg-neutral-800 text-neutral-300'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Spinner className="text-foreground" />
            <p className="mt-4 text-neutral-400">Cargando reservas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
              <p className="text-neutral-400 mt-2">Gestiona todas tus reservas de alojamientos</p>
            </div>
            
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
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {viewMode === 'calendar' ? (
          <div>
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
                  
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full bg-neutral-800 text-neutral-300 py-2 px-4 hover:bg-neutral-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 p-8 text-center">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tienes reservas</h3>
            <p className="text-neutral-400 mb-4">Cuando hagas una reserva, aparecerá aquí.</p>
            <Link
              href="/"
              className="inline-block bg-foreground text-background px-6 py-2 hover:bg-neutral-200 transition-colors"
            >
              Ver alojamientos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
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
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${getStatusColor(booking.status)}`}>
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

                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <div className="text-sm text-neutral-400">
                    Reservado el {new Date(booking.created_at).toLocaleDateString('es-ES')}
                    {booking.payment_id && (
                      <span className="ml-2 flex items-center">
                        <CreditCard className="w-4 h-4 mr-1" />
                        ID: {booking.payment_id}
                      </span>
                    )}
                  </div>
                  
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => {
                        // Aquí podrías implementar la lógica para reintento de pago
                        alert('Funcionalidad de reintento de pago próximamente')
                      }}
                      className="text-sm bg-foreground text-background px-4 py-2 hover:bg-neutral-200 transition-colors"
                    >
                      Completar pago
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}