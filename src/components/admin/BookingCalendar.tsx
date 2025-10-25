'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Booking } from '@/types/database'

interface BookingCalendarProps {
  bookings: Booking[]
  propertyId?: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  bookings: Booking[]
}

export default function BookingCalendar({ bookings, propertyId }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const getBookingsForDate = useCallback((date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0]
    
    return bookings.filter(booking => {
      // Filtrar por propiedad si se especifica
      if (propertyId && booking.property_id !== propertyId) {
        return false
      }
      
      // Solo mostrar reservas pagadas
      if (booking.status !== 'paid') {
        return false
      }
      
      const startDate = booking.start_date
      const endDate = booking.end_date
      
      return dateStr >= startDate && dateStr <= endDate
    })
  }, [bookings, propertyId])

  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)
    
    // Días a mostrar antes del primer día del mes
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Días a mostrar después del último día del mes
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days: CalendarDay[] = []
    const currentDateIterator = new Date(startDate)
    
    while (currentDateIterator <= endDate) {
      const dayBookings = getBookingsForDate(currentDateIterator)
      
      days.push({
        date: new Date(currentDateIterator),
        isCurrentMonth: currentDateIterator.getMonth() === month,
        bookings: dayBookings
      })
      
      currentDateIterator.setDate(currentDateIterator.getDate() + 1)
    }
    
    setCalendarDays(days)
  }, [currentDate, getBookingsForDate])

  useEffect(() => {
    generateCalendarDays()
  }, [generateCalendarDays])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendario de Reservas
          </h3>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-foreground text-background hover:bg-neutral-200 transition-colors"
          >
            Hoy
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <h2 className="text-lg font-medium text-foreground min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-neutral-400">
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[50px] p-2 border border-neutral-700 ${
              day.isCurrentMonth ? 'bg-neutral-800' : 'bg-neutral-900'
            } ${isToday(day.date) ? 'ring-2 ring-foreground' : ''}`}
          >
            <div className={`text-sm font-medium mb-1 ${
              day.isCurrentMonth ? 'text-foreground' : 'text-neutral-500'
            }`}>
              {day.date.getDate()}
            </div>
            
            {/* Reservas del día */}
            <div className="space-y-1">
              {day.bookings.slice(0, 2).map((booking, bookingIndex) => (
                <div
                  key={bookingIndex}
                  className="text-xs p-1 bg-green-900 text-green-300 border border-green-700 truncate"
                  title={`${booking.user_name} - ${booking.user_email}`}
                >
                  {booking.user_name}
                </div>
              ))}
              
              {day.bookings.length > 2 && (
                <div className="text-xs text-neutral-400">
                  +{day.bookings.length - 2} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-900 border border-green-700"></div>
          <span className="text-neutral-400">Reserva confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-foreground bg-neutral-800"></div>
          <span className="text-neutral-400">Día actual</span>
        </div>
      </div>
    </div>
  )
}