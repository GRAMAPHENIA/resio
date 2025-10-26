import { createClient } from '@/lib/supabase/client'
import { Booking } from '@/types/database'

export interface CreateBookingData {
  property_id: string
  user_name: string
  user_email: string
  user_phone?: string
  start_date: string
  end_date: string
  amount: number
}

export interface BookingWithProperty extends Booking {
  property: {
    name: string
    location: string
    price_per_night: number
  }
}

export class BookingService {
  private static supabase = createClient()

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert([{
        ...data,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear la reserva: ${error.message}`)
    }

    return booking
  }

  static async updateBookingPayment(bookingId: string, paymentId: string, status: 'paid' | 'cancelled' | 'pending'): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .update({
        payment_id: paymentId,
        status: status
      })
      .eq('id', bookingId)

    if (error) {
      throw new Error(`Error al actualizar el pago: ${error.message}`)
    }
  }

  static async getBookingsByUser(userEmail: string): Promise<BookingWithProperty[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, location, price_per_night)
      `)
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener las reservas: ${error.message}`)
    }

    return data as BookingWithProperty[]
  }

  static async getBookingById(id: string): Promise<BookingWithProperty | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, location, price_per_night)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error al obtener la reserva: ${error.message}`)
    }

    return data as BookingWithProperty
  }

  static async checkAvailability(propertyId: string, startDate: string, endDate: string, excludeBookingId?: string): Promise<boolean> {
    let query = this.supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'paid') // Solo considerar reservas PAGADAS como ocupadas
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    // Excluir una reserva específica (útil para actualizaciones)
    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    }

    return data.length === 0
  }

  static async checkAvailabilityIncludingPending(propertyId: string, startDate: string, endDate: string, excludeBookingId?: string): Promise<boolean> {
    let query = this.supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .neq('status', 'cancelled') // Incluir pending y paid
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    }

    return data.length === 0
  }

  static async cleanupExpiredPendingBookings(): Promise<void> {
    // Cancelar reservas pendientes de más de 30 minutos
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo)

    if (error) {
      console.error('Error cleaning up expired bookings:', error)
    }
  }

  static async deleteBooking(bookingId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      throw new Error(`Error al eliminar la reserva: ${error.message}`)
    }
  }
}