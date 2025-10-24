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

  static async updateBookingPayment(bookingId: string, paymentId: string, status: 'paid' | 'cancelled'): Promise<void> {
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

  static async checkAvailability(propertyId: string, startDate: string, endDate: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .neq('status', 'cancelled')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    if (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    }

    return data.length === 0
  }
}