import { NextResponse } from 'next/server'
import { BookingService } from '@/services/booking.service'

export async function POST() {
  try {
    // Limpiar reservas pendientes vencidas
    await BookingService.cleanupExpiredPendingBookings()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reservas pendientes vencidas limpiadas' 
    })
  } catch (error) {
    console.error('Error cleaning up bookings:', error)
    return NextResponse.json(
      { error: 'Error al limpiar reservas' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // También permitir GET para facilitar testing
    await BookingService.cleanupExpiredPendingBookings()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reservas pendientes vencidas limpiadas' 
    })
  } catch (error) {
    console.error('Error cleaning up bookings:', error)
    return NextResponse.json(
      { error: 'Error al limpiar reservas' },
      { status: 500 }
    )
  }
}