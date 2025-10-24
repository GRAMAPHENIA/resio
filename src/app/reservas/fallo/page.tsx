import { Suspense } from 'react'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

function FailureContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Pago fallido
        </h1>
        
        <p className="text-neutral-300 mb-6">
          Hubo un problema con tu pago. Tu reserva no ha sido confirmada. Puedes intentar nuevamente.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium"
          >
            Intentar nuevamente
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

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-neutral-400">Procesando...</p>
        </div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  )
}