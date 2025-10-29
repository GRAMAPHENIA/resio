import { NextResponse } from 'next/server'
import { BookingService } from '@/services/booking.service'

export async function POST(request: Request) {
  try {
    // Verificar API key para seguridad (opcional pero recomendado)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CLEANUP_API_KEY

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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