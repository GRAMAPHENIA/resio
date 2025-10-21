'use client'

import { useEffect } from 'react'

interface PaymentModalProps {
  preferenceId: string
  onClose: () => void
}

export default function PaymentModal({ preferenceId, onClose }: PaymentModalProps) {
  useEffect(() => {
    // For testing without Mercado Pago credentials
    console.log('Mock payment modal opened with preferenceId:', preferenceId)
  }, [preferenceId])

  const handleMockPayment = () => {
    alert('Pago simulado completado exitosamente!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-foreground mb-4">Completar Pago</h2>

        <div className="mb-4 text-center">
          <p className="text-neutral-400 mb-4">
            Modo de prueba: Simulación de pago con Mercado Pago
          </p>
          <div className="bg-neutral-800 p-4 rounded mb-4">
            <p className="text-sm text-neutral-400">ID de Preferencia:</p>
            <p className="text-xs font-mono text-foreground break-all">{preferenceId}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleMockPayment}
            className="w-full px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
          >
            Simular Pago Exitoso
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-neutral-700 text-foreground hover:bg-neutral-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}