import { createClient } from '@/lib/supabase/client'
import { Booking, Property } from '@/types/database'

/**
 * Verifica si una propiedad está disponible en un rango de fechas
 */
export async function checkPropertyAvailability(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc('check_property_availability', {
    p_property_id: propertyId,
    p_start_date: startDate,
    p_end_date: endDate
  })
  
  if (error) {
    console.error('Error checking availability:', error)
    return false
  }
  
  return data
}

/**
 * Obtiene las reservas de un mes específico
 */
export async function getMonthlyBookings(
  year?: number,
  month?: number,
  propertyId?: string
): Promise<Booking[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc('get_monthly_bookings', {
    p_year: year,
    p_month: month,
    p_property_id: propertyId
  })
  
  if (error) {
    console.error('Error fetching monthly bookings:', error)
    return []
  }
  
  return data || []
}

/**
 * Obtiene todas las reservas con información de la propiedad
 */
export async function getBookingsWithProperties(): Promise<(Booking & { property: Property })[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*)
    `)
    .order('start_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching bookings with properties:', error)
    return []
  }
  
  return data || []
}

/**
 * Crea una nueva reserva
 */
export async function createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
  const supabase = createClient()
  
  // Primero verificar disponibilidad
  const isAvailable = await checkPropertyAvailability(
    bookingData.property_id,
    bookingData.start_date,
    bookingData.end_date
  )
  
  if (!isAvailable) {
    throw new Error('La propiedad no está disponible en las fechas seleccionadas')
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating booking:', error)
    throw error
  }
  
  return data
}

/**
 * Actualiza el estado de una reserva
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'paid' | 'cancelled',
  paymentId?: string
): Promise<Booking | null> {
  const supabase = createClient()
  
  const updateData: { status: string; payment_id?: string } = { status }
  if (paymentId) {
    updateData.payment_id = paymentId
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating booking status:', error)
    throw error
  }
  
  return data
}

/**
 * Obtiene las fechas ocupadas de una propiedad
 */
export async function getOccupiedDates(propertyId: string): Promise<{ start: string; end: string }[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select('start_date, end_date')
    .eq('property_id', propertyId)
    .in('status', ['paid', 'pending'])
    .order('start_date')
  
  if (error) {
    console.error('Error fetching occupied dates:', error)
    return []
  }
  
  return data.map(booking => ({
    start: booking.start_date,
    end: booking.end_date
  }))
}

/**
 * Calcula estadísticas de reservas para una propiedad
 */
export async function getPropertyBookingStats(propertyId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('booking_stats')
    .select('*')
    .eq('property_id', propertyId)
    .single()
  
  if (error) {
    console.error('Error fetching booking stats:', error)
    return null
  }
  
  return data
}

/**
 * Obtiene las próximas reservas
 */
export async function getUpcomingBookings(limit: number = 10): Promise<Booking[]> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('start_date', today)
    .eq('status', 'paid')
    .order('start_date')
    .limit(limit)
  
  if (error) {
    console.error('Error fetching upcoming bookings:', error)
    return []
  }
  
  return data || []
}

/**
 * Calcula el número de noches entre dos fechas
 */
export function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula el precio total de una reserva
 */
export function calculateBookingTotal(
  pricePerNight: number,
  startDate: string,
  endDate: string
): number {
  const nights = calculateNights(startDate, endDate)
  return nights * pricePerNight
}