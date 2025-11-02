import { Suspense } from 'react'
import Link from 'next/link'
import { Clock, Mail } from 'lucide-react'

function PendingContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 text-center">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Pago pendiente
        </h1>
        
        <p className="text-neutral-300 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme tu reserva.
        </p>

        <div className="bg-yellow-900/20 border border-yellow-800 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Notificación automática</span>
          </div>
          <p className="text-sm text-neutral-300">
            Recibirás un email de confirmación cuando tu pago sea aprobado. También puedes revisar el estado de tu reserva desde "Mis Reservas".
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/tablero/reservas"
            className="block w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium"
          >
            Ver mis reservas
          </Link>
          
          <Link
            href="/tablero"
            className="block w-full border border-neutral-700 text-neutral-300 py-3 px-4 hover:bg-neutral-800 transition-colors"
          >
            Ir al tablero
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-neutral-400">Procesando...</p>
        </div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}