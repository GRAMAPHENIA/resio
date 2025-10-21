'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, DollarSign } from 'lucide-react'

export default function MisReservasPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            properties (
              name,
              location
            )
          `)
          .eq('user_email', user.email)
          .eq('status', 'paid') // Solo reservas pagadas
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching bookings:', error)
          return
        }

        setBookings(bookings || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserBookings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-neutral-400">Cargando tus reservas...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Reservas</h1>
          <p className="text-neutral-400">Historial de tus reservas confirmadas</p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <div key={booking.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {booking.properties?.name || 'Propiedad'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {booking.properties?.location || 'Ubicación no disponible'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Check-in</div>
                          <div className="text-sm text-neutral-400">
                            {new Date(booking.start_date).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Check-out</div>
                          <div className="text-sm text-neutral-400">
                            {new Date(booking.end_date).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Total pagado</div>
                          <div className="text-lg font-bold text-purple-400">
                            ${booking.amount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-900 text-green-200">
                      Confirmada
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes reservas aún
            </h3>
            <p className="text-neutral-400 mb-6">
              Explora nuestras propiedades disponibles y realiza tu primera reserva
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:bg-neutral-200 transition-colors"
            >
              Explorar Propiedades
            </a>
          </div>
        )}
      </div>
    </div>
  )
}