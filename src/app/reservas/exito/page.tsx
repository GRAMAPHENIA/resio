import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function SuccessContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          ¡Pago exitoso!
        </h1>
        
        <p className="text-neutral-300 mb-6">
          Tu reserva ha sido confirmada. Recibirás un email con los detalles de tu reserva.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/tablero/reservas"
            className="block w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium"
          >
            Ver mis reservas
          </Link>
          
          <Link
            href="/"
            className="block w-full border border-neutral-700 text-neutral-300 py-3 px-4 hover:bg-neutral-800 transition-colors"
          >
            Ver más alojamientos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-neutral-400">Procesando...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}