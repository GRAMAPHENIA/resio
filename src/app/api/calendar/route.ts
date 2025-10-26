import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '@/services/calendar.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('property_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const type = searchParams.get('type') || 'events'

    switch (type) {
      case 'events':
        if (propertyId) {
          const events = await CalendarService.getPropertyCalendar(propertyId, startDate || undefined, endDate || undefined)
          return NextResponse.json({ events })
        } else {
          const events = await CalendarService.getAllBookingsCalendar(startDate || undefined, endDate || undefined)
          return NextResponse.json({ events })
        }

      case 'availability':
        if (!propertyId) {
          return NextResponse.json({ error: 'property_id es requerido para verificar disponibilidad' }, { status: 400 })
        }

        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

        const availability = await CalendarService.getMonthAvailability(propertyId, year, month)
        return NextResponse.json({ availability })

      case 'stats':
        const stats = await CalendarService.getOccupancyStats(
          propertyId || undefined,
          startDate || undefined,
          endDate || undefined
        )
        return NextResponse.json({ stats })

      default:
        return NextResponse.json({ error: 'Tipo de consulta no válido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}