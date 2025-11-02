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
      amount,
      user_id // ID del usuario autenticado (opcional)
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
        { error: 'La propiedad no está disponible en las fechas seleccionadas (reserva confirmada)' },
        { status: 409 }
      )
    }

    // También verificar si hay reservas pendientes recientes (menos de 30 min)
    const hasRecentPending = await BookingService.checkRecentPendingBookings(property_id, start_date, end_date)
    if (hasRecentPending) {
      return NextResponse.json(
        { error: 'Hay una reserva pendiente de pago en estas fechas. Intenta nuevamente en unos minutos.' },
        { status: 409 }
      )
    }

    // Crear un ID temporal para la referencia externa (antes de crear la reserva real)
    const tempBookingId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calcular días de estadía
    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)
    const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))

    // Crear preferencia de MercadoPago con referencia temporal
    const preference = await MercadoPagoService.createPreference({
      title: `Reserva: ${property_name}`,
      quantity: 1,
      unit_price: amount,
      currency_id: 'ARS',
      description: `Reserva de ${days} ${days === 1 ? 'día' : 'días'} en ${property_name}`,
      external_reference: tempBookingId,
      payer: {
        name: user_name,
        email: user_email
      }
    })

    // Almacenar temporalmente los datos de la reserva en memoria/cache
    // En producción, usar Redis o similar para esto
    const tempBookingData = {
      property_id,
      user_name,
      user_email,
      user_phone,
      start_date,
      end_date,
      amount,
      user_id,
      created_at: new Date().toISOString()
    }

    // Guardar en un mapa global temporal (solo para desarrollo)
    interface TempBookingData {
      property_id: string
      user_name: string
      user_email: string
      user_phone: string
      start_date: string
      end_date: string
      amount: number
      user_id?: string
      created_at: string
    }

    const globalAny = global as unknown as { tempBookings?: Map<string, TempBookingData> }
    if (!globalAny.tempBookings) {
      globalAny.tempBookings = new Map<string, TempBookingData>()
    }
    globalAny.tempBookings.set(tempBookingId, tempBookingData)

    console.log('🔍 DEBUG: Preferencia de MercadoPago creada:', {
      tempBookingId,
      preference_id: preference.id,
      amount,
      property_name
    })

    return NextResponse.json({
      temp_booking_id: tempBookingId,
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