import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/services/booking.service'
import { CalendarService } from '@/services/calendar.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('property_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Faltan parámetros: property_id, start_date, end_date' },
        { status: 400 }
      )
    }

    // Limpiar reservas vencidas primero
    await BookingService.cleanupExpiredPendingBookings()

    // Verificar disponibilidad (solo paid)
    const isAvailable = await BookingService.checkAvailability(propertyId, startDate, endDate)
    
    // Verificar disponibilidad incluyendo pending
    const isAvailableIncludingPending = await BookingService.checkAvailabilityIncludingPending(propertyId, startDate, endDate)

    // Obtener todas las reservas para esas fechas
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    const { data: allBookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`)
    }

    // Obtener eventos del calendario
    const calendarEvents = await CalendarService.getPropertyCalendar(propertyId, startDate, endDate)

    return NextResponse.json({
      propertyId,
      dateRange: { startDate, endDate },
      availability: {
        onlyPaid: isAvailable,
        includingPending: isAvailableIncludingPending
      },
      bookings: {
        all: allBookings,
        count: allBookings.length,
        byStatus: {
          paid: allBookings.filter(b => b.status === 'paid').length,
          pending: allBookings.filter(b => b.status === 'pending').length,
          cancelled: allBookings.filter(b => b.status === 'cancelled').length
        }
      },
      calendarEvents: {
        events: calendarEvents,
        count: calendarEvents.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug availability error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}