import { createClient } from '@/lib/supabase/client'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  property_id: string
  property_name: string
  guest_name: string
  guest_email: string
  status: 'confirmed' | 'pending' | 'cancelled'
  amount: number
  created_at: string
}

export interface AvailabilityCheck {
  date: string
  available: boolean
  booking_id?: string
}

export class CalendarService {
  private static supabase = createClient()

  /**
   * Obtener eventos del calendario para una propiedad específica
   */
  static async getPropertyCalendar(propertyId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from('bookings')
      .select(`
        id,
        start_date,
        end_date,
        user_name,
        user_email,
        amount,
        status,
        created_at,
        property:properties(name)
      `)
      .eq('property_id', propertyId)
      .neq('status', 'cancelled')

    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate)
    }

    const { data, error } = await query.order('start_date', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener el calendario: ${error.message}`)
    }

    return data.map(booking => ({
      id: booking.id,
      title: `Reserva - ${booking.user_name}`,
      start: booking.start_date,
      end: booking.end_date,
      property_id: propertyId,
      property_name: (booking.property as { name?: string })?.name || 'Propiedad',
      guest_name: booking.user_name,
      guest_email: booking.user_email,
      status: booking.status === 'paid' ? 'confirmed' : booking.status as 'pending' | 'cancelled',
      amount: booking.amount,
      created_at: booking.created_at
    }))
  }

  /**
   * Obtener todos los eventos del calendario para el dashboard del propietario
   */
  static async getAllBookingsCalendar(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from('bookings')
      .select(`
        id,
        start_date,
        end_date,
        user_name,
        user_email,
        amount,
        status,
        created_at,
        property_id,
        property:properties(name)
      `)
      .neq('status', 'cancelled')

    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate)
    }

    const { data, error } = await query.order('start_date', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener el calendario: ${error.message}`)
    }

    return data.map(booking => ({
      id: booking.id,
      title: `${(booking.property as { name?: string })?.name || 'Propiedad'} - ${booking.user_name}`,
      start: booking.start_date,
      end: booking.end_date,
      property_id: booking.property_id,
      property_name: (booking.property as { name?: string })?.name || 'Propiedad',
      guest_name: booking.user_name,
      guest_email: booking.user_email,
      status: booking.status === 'paid' ? 'confirmed' : booking.status as 'pending' | 'cancelled',
      amount: booking.amount,
      created_at: booking.created_at
    }))
  }

  /**
   * Verificar disponibilidad de una propiedad en un rango de fechas
   * Solo considera reservas PAGADAS como ocupadas
   */
  static async checkAvailability(propertyId: string, startDate: string, endDate: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'paid') // Solo reservas pagadas bloquean disponibilidad
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    if (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    }

    return data.length === 0
  }

  /**
   * Obtener disponibilidad día por día para un mes específico
   */
  static async getMonthAvailability(propertyId: string, year: number, month: number): Promise<AvailabilityCheck[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select('id, start_date, end_date, status')
      .eq('property_id', propertyId)
      .eq('status', 'paid') // Solo reservas pagadas bloquean disponibilidad
      .gte('start_date', startDate)
      .lte('end_date', endDate)

    if (error) {
      throw new Error(`Error al obtener disponibilidad: ${error.message}`)
    }

    // Generar todos los días del mes
    const daysInMonth = new Date(year, month, 0).getDate()
    const availability: AvailabilityCheck[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day).toISOString().split('T')[0]
      
      // Verificar si hay alguna reserva que cubra este día
      const booking = bookings.find(b => 
        currentDate >= b.start_date && currentDate <= b.end_date
      )

      availability.push({
        date: currentDate,
        available: !booking,
        booking_id: booking?.id
      })
    }

    return availability
  }

  /**
   * Obtener estadísticas de ocupación
   */
  static async getOccupancyStats(propertyId?: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('bookings')
      .select('id, start_date, end_date, amount, status')
      .neq('status', 'cancelled')

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate)
    }

    const { data: bookings, error } = await query

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`)
    }

    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter(b => b.status === 'paid').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const totalRevenue = bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0)

    // Calcular días ocupados
    const occupiedDays = bookings.reduce((total, booking) => {
      const start = new Date(booking.start_date)
      const end = new Date(booking.end_date)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return total + days
    }, 0)

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue,
      occupiedDays,
      occupancyRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
    }
  }
}