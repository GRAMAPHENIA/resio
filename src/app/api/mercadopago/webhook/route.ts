import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/services/booking.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // Aquí deberías hacer una llamada a la API de MercadoPago para obtener los detalles del pago
      // Por simplicidad, asumimos que el pago fue aprobado
      // En producción, debes verificar el estado real del pago
      
      const externalReference = body.external_reference
      
      if (externalReference) {
        // Actualizar el estado de la reserva
        await BookingService.updateBookingPayment(
          externalReference,
          paymentId.toString(),
          'paid'
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

// MercadoPago también puede enviar notificaciones via GET
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic')
  const id = searchParams.get('id')

  if (topic === 'payment' && id) {
    // Procesar notificación de pago
    // Similar al POST pero con parámetros de query
  }

  return NextResponse.json({ received: true })
}