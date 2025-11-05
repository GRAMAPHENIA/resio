import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, Clock, Phone, Mail, Home, Info, Download } from 'lucide-react'
import { Container } from '@/infrastructure/container/Container'

async function SuccessContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const paymentId = searchParams.payment_id as string
  const externalReference = searchParams.external_reference as string
  const bookingId = searchParams.booking_id as string

  let booking = null
  let property = null

  // Usar el ID de reserva si está disponible, sino usar external_reference
  const id = bookingId || externalReference

  if (id) {
    try {
      const container = Container.getInstance()
      const bookingService = container.getBookingService()
      
      const result = await bookingService.getBooking({ bookingId: id })
      booking = result.booking
      property = result.property
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

        {booking && property && (
          <div className="bg-neutral-800 border border-neutral-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detalles de tu reserva</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-foreground font-medium">{property.name}</p>
                  <p className="text-sm text-neutral-400">{property.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-foreground">
                    {booking.dateRange.getFormattedRange()}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {booking.dateRange.getNights()} {booking.dateRange.getNights() === 1 ? 'noche' : 'noches'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-foreground">Huésped: {booking.contactInfo.name}</p>
                  <p className="text-sm text-neutral-400">Total pagado: ${booking.amount.toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información importante post-pago */}
        <div className="bg-blue-900/20 border border-blue-800 p-6 mb-6">
          <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            ¿Qué sigue ahora?
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <p className="text-blue-200 font-medium">Confirmación inmediata</p>
                <p className="text-blue-300">Tu reserva está confirmada y el pago fue procesado exitosamente</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <p className="text-blue-200 font-medium">Email de confirmación</p>
                <p className="text-blue-300">Recibirás un email con todos los detalles en los próximos minutos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <p className="text-blue-200 font-medium">Contacto del propietario</p>
                <p className="text-blue-300">El propietario se contactará contigo 24-48hs antes del check-in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <div>
                <p className="text-blue-200 font-medium">Dashboard del propietario</p>
                <p className="text-blue-300">Tu reserva aparece automáticamente en el panel del administrador</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de contacto y check-in */}
        {booking && (
          <div className="bg-neutral-800 border border-neutral-700 p-6 mb-6">
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Información importante
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400 mb-1">Check-in</p>
                <p className="text-foreground">15:00 hs</p>
              </div>

              <div>
                <p className="text-neutral-400 mb-1">Check-out</p>
                <p className="text-foreground">11:00 hs</p>
              </div>

              <div>
                <p className="text-neutral-400 mb-1">Código de reserva</p>
                <p className="text-foreground font-mono">{booking.getBookingCode()}</p>
              </div>

              <div>
                <p className="text-neutral-400 mb-1">Estado</p>
                <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                  Confirmada y Pagada
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-700">
              <p className="text-neutral-400 text-sm mb-2">Contacto de emergencia:</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-foreground">+54 9 11 1234-5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-foreground">soporte@resio.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-900/20 border border-green-800 p-4 mb-6">
          <p className="text-green-300 text-sm">
            ✓ Tu reserva está confirmada y agendada<br />
            ✓ El propietario ha sido notificado automáticamente<br />
            ✓ Puedes ver tu reserva en &quot;Mis Reservas&quot; en cualquier momento
          </p>
        </div>

        <div className="space-y-3">
          {booking && (
            <Link
              href={`/reservas/detalle/${booking.id}`}
              className="w-full bg-blue-600 text-white py-3 px-4 hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Ver detalles completos
            </Link>
          )}

          <Link
            href="/tablero/reservas"
            className="block w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium text-center"
          >
            Ver todas mis reservas
          </Link>

          <Link
            href="/"
            className="block w-full border border-neutral-700 text-neutral-300 py-3 px-4 hover:bg-neutral-800 transition-colors text-center"
          >
            Hacer otra reserva
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