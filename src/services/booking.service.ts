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
  user_id?: string // ID del usuario autenticado (opcional)
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

  // Método para crear cliente con auth bypass para operaciones administrativas
  private static async getAdminClient() {
    // Para operaciones que requieren bypass de RLS, usar service role key
    // Importar dinámicamente para evitar problemas en cliente
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')

    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Nuevo método para confirmar reserva desde admin
  static async confirmBooking(bookingId: string): Promise<void> {
    console.log('🔍 DEBUG: Confirmando reserva desde admin:', bookingId)

    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId)
      .eq('status', 'pending') // Solo confirmar si está pendiente

    if (error) {
      console.error('❌ ERROR: Error al confirmar la reserva:', error)
      throw new Error(`Error al confirmar la reserva: ${error.message}`)
    }

    console.log('✅ DEBUG: Reserva confirmada exitosamente')
  }

  // Método para obtener reservas pendientes (para dashboard admin)
  static async getPendingBookings(): Promise<BookingWithProperty[]> {
    console.log('🔍 DEBUG: Obteniendo reservas pendientes para dashboard')

    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, location, price_per_night)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ ERROR: Error al obtener reservas pendientes:', error)
      throw new Error(`Error al obtener reservas pendientes: ${error.message}`)
    }

    console.log('✅ DEBUG: Reservas pendientes obtenidas:', data?.length || 0)
    return data as BookingWithProperty[]
  }

  // Método para obtener reservas confirmadas (para dashboard admin)
  static async getConfirmedBookings(): Promise<BookingWithProperty[]> {
    console.log('🔍 DEBUG: Obteniendo reservas confirmadas para dashboard')

    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, location, price_per_night)
      `)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ ERROR: Error al obtener reservas confirmadas:', error)
      throw new Error(`Error al obtener reservas confirmadas: ${error.message}`)
    }

    console.log('✅ DEBUG: Reservas confirmadas obtenidas:', data?.length || 0)
    return data as BookingWithProperty[]
  }

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    console.log('🔍 DEBUG: Creando reserva con datos:', {
      property_id: data.property_id,
      user_name: data.user_name,
      user_email: data.user_email,
      start_date: data.start_date,
      end_date: data.end_date,
      amount: data.amount,
      user_id: data.user_id
    })

    const bookingData = {
      property_id: data.property_id,
      user_name: data.user_name,
      user_email: data.user_email,
      user_phone: data.user_phone,
      start_date: data.start_date,
      end_date: data.end_date,
      amount: data.amount,
      status: 'pending' as const, // Crear como pendiente según requerimiento
      user_id: data.user_id
    }

    console.log('🔍 DEBUG: Datos finales para insertar:', bookingData)

    // Usar cliente con bypass de RLS para crear reservas
    const adminClient = await this.getAdminClient()
    const { data: booking, error } = await adminClient
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (error) {
      console.error('❌ ERROR: Error al crear la reserva:', error)
      throw new Error(`Error al crear la reserva: ${error.message}`)
    }

    console.log('✅ DEBUG: Reserva creada exitosamente:', booking)
    return booking
  }

  static async updateBookingPayment(bookingId: string, paymentId: string, status: 'paid' | 'cancelled' | 'pending'): Promise<void> {
    console.log('🔍 DEBUG: Actualizando pago de reserva:', {
      bookingId,
      paymentId,
      status
    })

    const { error } = await this.supabase
      .from('bookings')
      .update({
        payment_id: paymentId,
        status: status
      })
      .eq('id', bookingId)

    if (error) {
      console.error('❌ ERROR: Error al actualizar el pago:', error)
      throw new Error(`Error al actualizar el pago: ${error.message}`)
    }

    console.log('✅ DEBUG: Pago actualizado exitosamente')
  }

  static async getBookingsByUser(userEmail: string): Promise<BookingWithProperty[]> {
    console.log('🔍 DEBUG: Obteniendo reservas por email:', userEmail)

    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        property:properties(name, location, price_per_night)
      `)
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ ERROR: Error al obtener las reservas:', error)
      throw new Error(`Error al obtener las reservas: ${error.message}`)
    }

    console.log('✅ DEBUG: Reservas obtenidas:', data?.length || 0)
    return data as BookingWithProperty[]
  }

  // Método para obtener reservas por user_id (para usuarios autenticados)
  // NOTA: La tabla bookings no tiene columna user_id, usa user_email
  static async getBookingsByUserId(): Promise<BookingWithProperty[]> {
    // Como no hay user_id en la tabla, devolver array vacío por ahora
    // En el futuro, si se migra la tabla para incluir user_id, se puede implementar
    console.warn('getBookingsByUserId called but bookings table does not have user_id column')
    return []
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
    console.log('🔍 DEBUG: Verificando disponibilidad:', {
      propertyId,
      startDate,
      endDate,
      excludeBookingId
    })

    let query = this.supabase
      .from('bookings')
      .select('id, status')
      .eq('property_id', propertyId)
      .eq('status', 'paid') // Solo considerar reservas PAGADAS como ocupadas
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    // Excluir una reserva específica (útil para actualizaciones)
    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ ERROR: Error al verificar disponibilidad:', error)
      throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    }

    const available = data.length === 0
    console.log('✅ DEBUG: Disponibilidad verificada:', {
      available,
      conflictingBookings: data.length,
      bookings: data
    })

    return available
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
    console.log('🔍 DEBUG: Limpiando reservas pendientes expiradas')

    // Cancelar reservas pendientes de más de 15 minutos
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const { data, error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lt('created_at', fifteenMinutesAgo)
      .select('id, user_name, user_email')

    if (error) {
      console.error('❌ ERROR: Error limpiando reservas expiradas:', error)
    } else {
      console.log('✅ DEBUG: Reservas expiradas canceladas:', data?.length || 0, data)
    }
  }

  static async cancelBooking(bookingId: string): Promise<void> {
    console.log('🔍 DEBUG: Cancelando reserva:', bookingId)

    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      console.error('❌ ERROR: Error al cancelar la reserva:', error)
      throw new Error(`Error al cancelar la reserva: ${error.message}`)
    }

    console.log('✅ DEBUG: Reserva cancelada exitosamente')
  }

  static async deleteBooking(bookingId: string): Promise<void> {
    console.log('🔍 DEBUG: Eliminando reserva:', bookingId)

    const { error } = await this.supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      console.error('❌ ERROR: Error al eliminar la reserva:', error)
      throw new Error(`Error al eliminar la reserva: ${error.message}`)
    }

    console.log('✅ DEBUG: Reserva eliminada exitosamente')
  }

  static async checkRecentPendingBookings(propertyId: string, startDate: string, endDate: string): Promise<boolean> {
    console.log('🔍 DEBUG: Verificando reservas pendientes recientes:', {
      propertyId,
      startDate,
      endDate
    })

    // Verificar si hay reservas pendientes de menos de 15 minutos
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const { data, error } = await this.supabase
      .from('bookings')
      .select('id, created_at')
      .eq('property_id', propertyId)
      .eq('status', 'pending')
      .gte('created_at', fifteenMinutesAgo)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

    if (error) {
      console.error('❌ ERROR: Error verificando reservas pendientes recientes:', error)
      return false
    }

    const hasRecentPending = data.length > 0
    console.log('✅ DEBUG: Verificación de pendientes recientes:', {
      hasRecentPending,
      count: data.length,
      bookings: data
    })

    return hasRecentPending
  }

  static async getAllBookingsForProperty(propertyId: string, startDate?: string, endDate?: string) {
    console.log('🔍 DEBUG: Obteniendo todas las reservas para propiedad:', {
      propertyId,
      startDate,
      endDate
    })

    let query = this.supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)

    if (startDate && endDate) {
      query = query.or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ ERROR: Error al obtener reservas:', error)
      throw new Error(`Error al obtener reservas: ${error.message}`)
    }

    console.log('✅ DEBUG: Reservas obtenidas:', data?.length || 0)
    return data
  }

  static async getBookingsByUserAndCode(userEmail: string, bookingCode: string): Promise<BookingWithProperty[]> {
    // Primero verificar que existe al menos una reserva con ese email y código
    const { data: verification, error: verificationError } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('user_email', userEmail)
      .ilike('id', `${bookingCode.toLowerCase()}%`) // El código es los primeros 8 caracteres del ID
      .limit(1)

    if (verificationError) {
      throw new Error(`Error al verificar credenciales: ${verificationError.message}`)
    }

    if (!verification || verification.length === 0) {
      throw new Error('Email o código de reserva incorrectos')
    }

    // Si la verificación es exitosa, obtener todas las reservas del usuario
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

  // Alias para compatibilidad - ahora intenta por user_id primero, luego por email
  static async getBookingsByEmail(userEmail: string, _userId?: string): Promise<BookingWithProperty[]> {
    console.log('🔍 DEBUG: Obteniendo reservas por email/ID:', { userEmail, _userId })

    return this.getBookingsByUser(userEmail)
  }
}