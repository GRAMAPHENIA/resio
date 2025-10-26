import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, Clock } from 'lucide-react'
import { BookingService } from '@/services/booking.service'

async function SuccessContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const paymentId = searchParams.payment_id as string
  const externalReference = searchParams.external_reference as string
  
  let booking = null
  
  if (externalReference) {
    try {
      booking = await BookingService.getBookingById(externalReference)
    } catch (error) {
      console.error('Error fetching booking:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 p-8">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ¡Pago exitoso!
          </h1>
          
          <p className="text-neutral-300">
            Tu reserva ha sido confirmada exitosamente
          </p>
        </div>

        {booking && (
          <div className="bg-neutral-800 border border-neutral-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detalles de tu reserva</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-foreground font-medium">{booking.property.name}</p>
                  <p className="text-sm text-neutral-400">{booking.property.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-foreground">
                    {new Date(booking.start_date).toLocaleDateString('es-AR')} - {new Date(booking.end_date).toLocaleDateString('es-AR')}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} noches
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-foreground">Huésped: {booking.user_name}</p>
                  <p className="text-sm text-neutral-400">Total pagado: ${booking.amount.toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-900/20 border border-green-800 p-4 mb-6">
          <p className="text-green-300 text-sm">
            ✓ Recibirás un email de confirmación con todos los detalles<br/>
            ✓ Tu reserva ya está agendada en el calendario<br/>
            ✓ El propietario ha sido notificado
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/tablero/reservas"
            className="block w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium text-center"
          >
            Ver mis reservas
          </Link>
          
          <Link
            href="/"
            className="block w-full border border-neutral-700 text-neutral-300 py-3 px-4 hover:bg-neutral-800 transition-colors text-center"
          >
            Ver más alojamientos
          </Link>
        </div>

        {paymentId && (
          <p className="text-xs text-neutral-500 text-center mt-4">
            ID de pago: {paymentId}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-neutral-400">Procesando...</p>
        </div>
      </div>
    }>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}