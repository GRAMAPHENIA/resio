import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/services/mercadopago.service'
import { BookingService } from '@/services/booking.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      property_id, 
      property_name, 
      user_name, 
      user_email, 
      user_phone,
      start_date, 
      end_date, 
      amount 
    } = body

    // Validar datos requeridos
    if (!property_id || !property_name || !user_name || !user_email || !user_phone || !start_date || !end_date || !amount) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Limpiar reservas pendientes vencidas antes de verificar disponibilidad
    await BookingService.cleanupExpiredPendingBookings()

    // Verificar disponibilidad (solo considera reservas pagadas)
    const isAvailable = await BookingService.checkAvailability(property_id, start_date, end_date)
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'La propiedad no está disponible en las fechas seleccionadas' },
        { status: 409 }
      )
    }

    // Crear la reserva pendiente
    const booking = await BookingService.createBooking({
      property_id,
      user_name,
      user_email,
      start_date,
      end_date,
      amount
    })

    // Calcular días de estadía
    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)
    const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))

    // Crear preferencia de MercadoPago
    const preference = await MercadoPagoService.createPreference({
      title: `Reserva: ${property_name}`,
      quantity: 1,
      unit_price: amount,
      currency_id: 'ARS',
      description: `Reserva de ${days} ${days === 1 ? 'día' : 'días'} en ${property_name}`,
      external_reference: booking.id,
      payer: {
        name: user_name,
        email: user_email
      }
    })

    return NextResponse.json({
      booking_id: booking.id,
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    })

  } catch (error) {
    console.error('Error creating preference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}