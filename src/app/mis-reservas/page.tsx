'use client'

import { useState } from 'react'
import { BookingService, BookingWithProperty } from '@/services/booking.service'
import { Calendar, MapPin, CreditCard, Search } from 'lucide-react'
import Link from 'next/link'

export default function MisReservasPage() {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

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
          <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
          <p className="text-neutral-400 mt-2">Consulta tus reservas ingresando tu email</p>
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

        {/* Resultados */}
        {searched && (
          <>
            {bookings.length > 0 ? (
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
                    </div>
                  </div>
                ))}
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
          </>
        )}

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