'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBooking } from '@/presentation/hooks/useBooking'
import { Calendar, Clock, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react'

interface BookingData {
  id: string;
  bookingCode: string;
  status: { value: string; display: string; color: string };
  dateRange: { formatted: string; nights: number };
  amount: number;
  createdAt: string;
  canCancel: boolean;
  canCompletePayment: boolean;
}

interface UserBookingsListProps {
  email?: string
  userId?: string
  showFilters?: boolean
}

type FilterStatus = 'all' | 'paid' | 'pending' | 'cancelled'

export default function UserBookingsList({ email, userId, showFilters = true }: UserBookingsListProps) {
  const { getUserBookings, loading, error, clearError } = useBooking()
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const loadBookings = useCallback(async () => {
    const result = await getUserBookings({ email, userId })
    setBookings(result)
  }, [email, userId, getUserBookings])

  useEffect(() => {
    if (email || userId) {
      loadBookings()
    }
  }, [email, userId, loadBookings])

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status.value === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-900/20 text-green-400 border-green-700'
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700'
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border-red-700'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        <span className="ml-3 text-neutral-400">Cargando reservas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 p-4 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Mis Reservas</h2>
          <p className="text-neutral-400 text-sm">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'reserva' : 'reservas'}
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-800 border border-neutral-700 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-foreground text-background' 
                    : 'text-neutral-400 hover:text-foreground'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-foreground text-background' 
                    : 'text-neutral-400 hover:text-foreground'
                }`}
              >
                Calendario
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterStatus)}
              className="bg-neutral-800 border border-neutral-700 text-foreground px-3 py-2 rounded focus:outline-none focus:border-neutral-500"
            >
              <option value="all">Todas</option>
              <option value="paid">Confirmadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-300 mb-2">
            {filter === 'all' ? 'No tienes reservas' : `No tienes reservas ${filter}`}
          </h3>
          <p className="text-neutral-500">
            {filter === 'all' 
              ? 'Cuando hagas una reserva, aparecerá aquí.'
              : 'Prueba cambiando el filtro para ver otras reservas.'
            }
          </p>
        </div>
      )}

      {/* Bookings List */}
      {viewMode === 'list' && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-neutral-900 border border-neutral-800 p-6 hover:border-neutral-700 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Reserva #{booking.bookingCode}
                    </h3>
                    <div className={`flex items-center gap-1 px-2 py-1 border rounded text-xs ${getStatusBadgeClass(booking.status.value)}`}>
                      {getStatusIcon(booking.status.value)}
                      {booking.status.display}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-neutral-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      {booking.dateRange.formatted} ({booking.dateRange.nights} {booking.dateRange.nights === 1 ? 'noche' : 'noches'})
                    </div>
                    <div className="flex items-center text-neutral-300">
                      <CreditCard className="w-4 h-4 mr-2" />
                      ${booking.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-neutral-500">
                    Creada el {new Date(booking.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => window.location.href = `/reservas/detalle/${booking.id}`}
                    className="px-4 py-2 bg-neutral-800 text-foreground border border-neutral-700 hover:bg-neutral-700 transition-colors text-sm"
                  >
                    Ver Detalles
                  </button>

                  {booking.canCompletePayment && (
                    <button
                      onClick={() => {
                        // TODO: Implement payment completion
                        console.log('Complete payment for:', booking.id)
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Completar Pago
                    </button>
                  )}

                  {booking.status.value === 'paid' && (
                    <button
                      onClick={() => {
                        // TODO: Implement PDF download
                        console.log('Download PDF for:', booking.id)
                      }}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                    >
                      Descargar PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && filteredBookings.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">Vista de calendario próximamente</p>
            <p className="text-neutral-500 text-sm mt-2">
              Por ahora, usa la vista de lista para ver tus reservas
            </p>
          </div>
        </div>
      )}
    </div>
  )
}