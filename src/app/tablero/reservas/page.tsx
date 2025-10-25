'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { BookingService, BookingWithProperty } from '@/services/booking.service'
import { Calendar, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Spinner from '@/components/ui/spinner'

export default function ReservasPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
          <p className="text-neutral-400 mt-2">Gestiona todas tus reservas de alojamientos</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-8 border border-gray-200 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
            <p className="text-gray-600 mb-4">Cuando hagas una reserva, aparecerá aquí.</p>
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
              <div key={booking.id} className="bg-white border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {booking.property.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
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
                    <p className="text-sm text-gray-600">Entrada</p>
                    <p className="font-medium">
                      {new Date(booking.start_date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Salida</p>
                    <p className="font-medium">
                      {new Date(booking.end_date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-medium text-lg">${booking.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
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
                      className="text-sm bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors"
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