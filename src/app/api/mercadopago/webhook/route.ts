import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/services/booking.service'
import { MercadoPagoService } from '@/services/mercadopago.service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Webhook received:', body)

    // Verificar la firma del webhook (opcional pero recomendado)
    if (process.env.MP_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-signature')
      const requestId = request.headers.get('x-request-id')
      
      if (signature && requestId) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
          .update(`${requestId}${JSON.stringify(body)}`)
          .digest('hex')
        
        if (signature !== `v1=${expectedSignature}`) {
          console.error('Invalid webhook signature')
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }
      }
    }
    
    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      if (!paymentId) {
        console.error('No payment ID in webhook')
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
      }

      // Obtener los detalles del pago desde MercadoPago
      const paymentDetails = await MercadoPagoService.getPayment(paymentId)
      
      if (paymentDetails && paymentDetails.external_reference) {
        const bookingId = paymentDetails.external_reference
        
        // Actualizar el estado de la reserva según el estado del pago
        let bookingStatus: 'paid' | 'cancelled' | 'pending' | null = null
        
        switch (paymentDetails.status) {
          case 'approved':
            bookingStatus = 'paid'
            break
          case 'cancelled':
          case 'rejected':
            bookingStatus = 'cancelled'
            break
          case 'pending':
          case 'in_process':
            // No actualizamos para pending, ya está en pending por defecto
            console.log(`Payment ${paymentId} is still pending, no update needed`)
            break
        }

        // Solo actualizar si hay un cambio de estado definitivo
        if (bookingStatus) {
          await BookingService.updateBookingPayment(
            bookingId,
            paymentId.toString(),
            bookingStatus
          )
          console.log(`Booking ${bookingId} updated to ${bookingStatus}`)
        }
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
  try {
    const searchParams = request.nextUrl.searchParams
    const topic = searchParams.get('topic')
    const id = searchParams.get('id')

    console.log('GET Webhook:', { topic, id })

    if (topic === 'payment' && id) {
      // Obtener los detalles del pago
      const paymentDetails = await MercadoPagoService.getPayment(id)
      
      if (paymentDetails && paymentDetails.external_reference) {
        const bookingId = paymentDetails.external_reference
        
        let bookingStatus: 'paid' | 'cancelled' | 'pending' | null = null
        
        switch (paymentDetails.status) {
          case 'approved':
            bookingStatus = 'paid'
            break
          case 'cancelled':
          case 'rejected':
            bookingStatus = 'cancelled'
            break
          case 'pending':
          case 'in_process':
            // No actualizamos para pending, ya está en pending por defecto
            console.log(`Payment ${id} is still pending, no update needed`)
            break
        }

        // Solo actualizar si hay un cambio de estado definitivo
        if (bookingStatus) {
          await BookingService.updateBookingPayment(
            bookingId,
            id,
            bookingStatus
          )
          console.log(`Booking ${bookingId} updated to ${bookingStatus} via GET`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('GET Webhook error:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}