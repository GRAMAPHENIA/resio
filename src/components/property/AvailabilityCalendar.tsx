'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AvailabilityCalendarProps {
  propertyId: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isAvailable: boolean
  isToday: boolean
}

interface Booking {
  start_date: string
  end_date: string
  status: string
}

export default function AvailabilityCalendar({ propertyId }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  // Obtener reservas de la propiedad
  const fetchBookings = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date, status')
        .eq('property_id', propertyId)
        .in('status', ['paid', 'pending'])

      if (!error && data) {
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  // Verificar si una fecha está disponible
  const isDateAvailable = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    
    return !bookings.some(booking => {
      const startDate = booking.start_date
      const endDate = booking.end_date
      return dateStr >= startDate && dateStr <= endDate
    })
  }, [bookings])

  // Generar días del calendario
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days: CalendarDay[] = []
    const currentDateIterator = new Date(startDate)
    const today = new Date()
    
    while (currentDateIterator <= endDate) {
      const isCurrentMonth = currentDateIterator.getMonth() === month
      const isToday = currentDateIterator.toDateString() === today.toDateString()
      const isAvailable = isCurrentMonth && isDateAvailable(currentDateIterator)
      
      days.push({
        date: new Date(currentDateIterator),
        isCurrentMonth,
        isAvailable,
        isToday
      })
      
      currentDateIterator.setDate(currentDateIterator.getDate() + 1)
    }
    
    setCalendarDays(days)
  }, [currentDate, isDateAvailable])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (!loading) {
      generateCalendarDays()
    }
  }, [generateCalendarDays, loading])

  // Suscripción en tiempo real a cambios en reservas
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `property_id=eq.${propertyId}`
        },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [propertyId, fetchBookings])

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

  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-700 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-10 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Disponibilidad</h3>
        </div>
        
        <button
          onClick={goToToday}
          className="px-3 py-1 text-sm bg-foreground text-background hover:bg-neutral-200 transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <h2 className="text-lg font-medium text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
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
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              h-10 flex items-center justify-center text-sm border border-neutral-700
              ${day.isCurrentMonth ? 'text-foreground' : 'text-neutral-500'}
              ${day.isToday ? 'ring-2 ring-foreground' : ''}
              ${day.isCurrentMonth && day.isAvailable ? 'bg-green-900/30 hover:bg-green-900/50' : ''}
              ${day.isCurrentMonth && !day.isAvailable ? 'bg-red-900/30' : ''}
              ${!day.isCurrentMonth ? 'bg-neutral-800' : 'bg-neutral-800'}
            `}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-900/50 border border-neutral-700"></div>
          <span className="text-neutral-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-900/50 border border-neutral-700"></div>
          <span className="text-neutral-400">Reservado</span>
        </div>
      </div>
    </div>
  )
}