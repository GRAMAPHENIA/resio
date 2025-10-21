'use client'

import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

async function getUserBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (
        name,
        location,
        image_url
      )
    `)
    .eq('user_email', user.email) // Solo mostrar reservas del usuario actual
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }

  return bookings || []
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      const userBookings = await getUserBookings()
      setBookings(userBookings)
      setLoading(false)
    }

    fetchBookings()
  }, [])

  const handleCancelBooking = (bookingId: string) => {
    setBookingToCancel(bookingId)
    setShowCancelModal(true)
  }

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingToCancel)

      if (error) throw error

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingToCancel
          ? { ...booking, status: 'cancelled' }
          : booking
      ))

      setShowCancelModal(false)
      setBookingToCancel(null)
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const handlePayBooking = async (booking: any) => {
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: booking.amount,
          property_name: booking.properties?.name || 'Propiedad',
          user_name: booking.user_name,
          user_email: booking.user_email
        })
      })

      if (!response.ok) throw new Error('Error creating payment preference')

      const { preferenceId } = await response.json()

      // Redirect to Mercado Pago
      window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Error al procesar el pago')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-neutral-400">Cargando reservas...</div>
          </div>
        </div>
  
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Mis Reservas</h1>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Pagar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Cancelar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-neutral-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {booking.properties?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div>
                        <div className="font-medium">{booking.user_name}</div>
                        <div className="text-neutral-400">{booking.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div>
                        <div>Desde: {new Date(booking.start_date).toLocaleDateString()}</div>
                        <div>Hasta: {new Date(booking.end_date).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'paid'
                          ? 'bg-green-900 text-green-200'
                          : booking.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {booking.status === 'paid' ? 'Pagado' :
                         booking.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${booking.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handlePayBooking(booking)}
                          className="px-3 py-1 text-xs bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition-colors"
                          title="Pagar reserva"
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {booking.status !== 'cancelled' && booking.status !== 'paid' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 text-neutral-400 hover:text-foreground transition-colors ml-4"
                          title="Cancelar reserva"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-400">
                      No hay reservas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}