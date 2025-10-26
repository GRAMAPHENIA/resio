import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/services/mercadopago.service'
import { BookingService } from '@/services/booking.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('payment_id')
    const bookingId = searchParams.get('booking_id')

    if (!paymentId && !bookingId) {
      return NextResponse.json(
        { error: 'Se requiere payment_id o booking_id' },
        { status: 400 }
      )
    }

    let paymentDetails = null
    let booking = null

    // Si tenemos payment_id, obtener detalles del pago
    if (paymentId) {
      paymentDetails = await MercadoPagoService.getPayment(paymentId)
    }

    // Si tenemos booking_id, obtener la reserva
    if (bookingId) {
      booking = await BookingService.getBookingById(bookingId)
      
      // Si la reserva tiene payment_id, obtener detalles del pago
      if (booking?.payment_id && !paymentDetails) {
        paymentDetails = await MercadoPagoService.getPayment(booking.payment_id)
      }
    }

    // Si tenemos detalles del pago pero no la reserva, buscarla por external_reference
    if (paymentDetails?.external_reference && !booking) {
      booking = await BookingService.getBookingById(paymentDetails.external_reference)
    }

    return NextResponse.json({
      payment: paymentDetails,
      booking: booking,
      status: paymentDetails?.status || booking?.status || 'unknown'
    })

  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json(
      { error: 'Error al verificar el estado del pago' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payment_id, booking_id } = await request.json()

    if (!payment_id || !booking_id) {
      return NextResponse.json(
        { error: 'Se requiere payment_id y booking_id' },
        { status: 400 }
      )
    }

    // Verificar el pago en MercadoPago
    const paymentDetails = await MercadoPagoService.getPayment(payment_id)
    
    if (!paymentDetails) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el estado de la reserva según el estado del pago
    let bookingStatus: 'paid' | 'cancelled' | 'pending' = 'pending'
    
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
        bookingStatus = 'pending'
        break
    }

    // Actualizar la reserva
    await BookingService.updateBookingPayment(
      booking_id,
      payment_id,
      bookingStatus
    )

    // Obtener la reserva actualizada
    const updatedBooking = await BookingService.getBookingById(booking_id)

    return NextResponse.json({
      payment: paymentDetails,
      booking: updatedBooking,
      status: bookingStatus,
      updated: true
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Error al verificar y actualizar el pago' },
      { status: 500 }
    )
  }
}