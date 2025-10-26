import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  CreditCard,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { BookingService } from '@/services/booking.service'

async function BookingDetailContent({ params }: { params: { id: string } }) {
  let booking = null
  
  try {
    booking = await BookingService.getBookingById(params.id)
  } catch (error) {
    console.error('Error fetching booking:', error)
  }

  if (!booking) {
    notFound()
  }

  const nights = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle,
          text: 'Confirmada y Pagada',
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-800'
        }
      case 'pending':
        return {
          icon: AlertCircle,
          text: 'Pendiente de Pago',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-800'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          text: 'Cancelada',
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-800'
        }
      default:
        return {
          icon: AlertCircle,
          text: status,
          color: 'text-neutral-400',
          bgColor: 'bg-neutral-900/20',
          borderColor: 'border-neutral-800'
        }
    }
  }

  const statusInfo = getStatusInfo(booking.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/tablero/reservas"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis reservas
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Detalles de Reserva
              </h1>
              <p className="text-neutral-400">
                Código: <span className="font-mono text-foreground">{booking.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors">
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Estado de la reserva */}
        <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} p-6 mb-6`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            <div>
              <h2 className={`text-lg font-semibold ${statusInfo.color}`}>
                {statusInfo.text}
              </h2>
              {booking.status === 'paid' && (
                <p className="text-sm text-neutral-300 mt-1">
                  Tu reserva está confirmada. El propietario se contactará contigo antes del check-in.
                </p>
              )}
              {booking.status === 'pending' && (
                <p className="text-sm text-neutral-300 mt-1">
                  Completa el pago para confirmar tu reserva. Tienes 30 minutos antes de que expire.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del alojamiento */}
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Alojamiento
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-foreground">{booking.property.name}</h4>
                  <div className="flex items-center gap-2 text-neutral-400 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.property.location}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Check-in</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-foreground">
                        {new Date(booking.start_date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">Desde las 15:00 hs</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Check-out</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-foreground">
                        {new Date(booking.end_date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">Hasta las 11:00 hs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del huésped */}
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Información del Huésped
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-400">Nombre completo</p>
                  <p className="text-foreground">{booking.user_name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-400">Email</p>
                  <p className="text-foreground">{booking.user_email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-400">Duración de la estadía</p>
                  <p className="text-foreground">{nights} {nights === 1 ? 'noche' : 'noches'}</p>
                </div>
              </div>
            </div>

            {/* Instrucciones importantes */}
            <div className="bg-blue-900/20 border border-blue-800 p-6">
              <h3 className="text-blue-300 font-semibold mb-4">
                Instrucciones Importantes
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>
                    <p className="text-blue-200 font-medium">Antes del check-in</p>
                    <p className="text-blue-300">El propietario se contactará contigo 24-48hs antes para coordinar la entrega de llaves y darte instrucciones específicas del alojamiento.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>
                    <p className="text-blue-200 font-medium">Documentación</p>
                    <p className="text-blue-300">Lleva tu DNI o documento de identidad. Es requerido para el registro de huéspedes.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>
                    <p className="text-blue-200 font-medium">Contacto de emergencia</p>
                    <p className="text-blue-300">Guarda nuestros datos de contacto por cualquier inconveniente durante tu estadía.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen de pago */}
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Resumen de Pago
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal ({nights} noches)</span>
                  <span className="text-foreground">${booking.amount.toLocaleString('es-AR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-400">Limpieza</span>
                  <span className="text-foreground">Incluido</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-400">Servicios</span>
                  <span className="text-foreground">Incluido</span>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-lg font-semibold text-foreground">
                      ${booking.amount.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
                
                {booking.payment_id && (
                  <div className="pt-3 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500">
                      ID de pago: {booking.payment_id}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Fecha: {new Date(booking.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                ¿Necesitas ayuda?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-foreground">+54 9 11 1234-5678</p>
                    <p className="text-xs text-neutral-400">Lun a Dom 9:00 - 21:00</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-foreground">soporte@resio.com</p>
                    <p className="text-xs text-neutral-400">Respuesta en 24hs</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <Link
                  href="/ayuda"
                  className="block w-full text-center py-2 px-4 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  Centro de Ayuda
                </Link>
              </div>
            </div>

            {/* Acciones */}
            {booking.status === 'pending' && (
              <div className="bg-yellow-900/20 border border-yellow-800 p-6">
                <h3 className="text-yellow-300 font-semibold mb-3">
                  Acción Requerida
                </h3>
                <p className="text-yellow-200 text-sm mb-4">
                  Tu reserva expirará pronto. Completa el pago para confirmarla.
                </p>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 hover:bg-yellow-700 transition-colors">
                  Completar Pago
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-neutral-400">Cargando detalles...</p>
        </div>
      </div>
    }>
      <BookingDetailContent params={params} />
    </Suspense>
  )
}