'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, DollarSign } from 'lucide-react'
import { CalendarEvent } from '@/services/calendar.service'

interface BookingCalendarProps {
  propertyId?: string
  onEventClick?: (event: CalendarEvent) => void
}

export default function BookingCalendar({ propertyId, onEventClick }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0
  })

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      // Obtener eventos
      const eventsParams = new URLSearchParams({
        type: 'events',
        start_date: startDate,
        end_date: endDate
      })
      
      if (propertyId) {
        eventsParams.append('property_id', propertyId)
      }

      const eventsResponse = await fetch(`/api/calendar?${eventsParams}`)
      const eventsData = await eventsResponse.json()

      // Obtener estadísticas
      const statsParams = new URLSearchParams({
        type: 'stats',
        start_date: startDate,
        end_date: endDate
      })
      
      if (propertyId) {
        statsParams.append('property_id', propertyId)
      }

      const statsResponse = await fetch(`/api/calendar?${statsParams}`)
      const statsData = await statsResponse.json()

      setEvents(eventsData.events || [])
      setStats(statsData.stats || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0
      })
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentDate, propertyId])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0]
    
    return events.filter(event => {
      const eventStart = new Date(event.start).toISOString().split('T')[0]
      const eventEnd = new Date(event.end).toISOString().split('T')[0]
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getStatusColor = (status: string, createdAt?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600'
      case 'pending':
        // Verificar si es una reserva pendiente reciente (menos de 30 min)
        if (createdAt) {
          const created = new Date(createdAt).getTime()
          const now = Date.now()
          const thirtyMinutes = 30 * 60 * 1000
          
          if (now - created < thirtyMinutes) {
            return 'bg-orange-600 animate-pulse' // Pendiente reciente
          }
        }
        return 'bg-yellow-600' // Pendiente que puede expirar pronto
      default:
        return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-800 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-neutral-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800">
      {/* Estadísticas */}
      <div className="p-6 border-b border-neutral-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-2xl font-bold text-foreground">{stats.totalBookings}</span>
            </div>
            <p className="text-sm text-neutral-400">Total Reservas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-foreground">{stats.confirmedBookings}</span>
            </div>
            <p className="text-sm text-neutral-400">Confirmadas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span className="text-2xl font-bold text-foreground">{stats.pendingBookings}</span>
            </div>
            <p className="text-sm text-neutral-400">Pendientes</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-foreground">
                ${stats.totalRevenue.toLocaleString('es-AR')}
              </span>
            </div>
            <p className="text-sm text-neutral-400">Ingresos</p>
          </div>
        </div>
      </div>

      {/* Navegación del calendario */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-neutral-800 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-neutral-800 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className="p-6">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-neutral-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((day, index) => {
            if (!day) {
              return <div key={index} className="h-20"></div>
            }

            const dayEvents = getEventsForDay(day)
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

            return (
              <div
                key={day}
                className={`h-20 border border-neutral-700 p-1 ${isToday ? 'bg-neutral-800' : 'bg-neutral-900'} hover:bg-neutral-800 transition-colors`}
              >
                <div className="text-sm text-foreground mb-1">{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => {
                    const isRecentPending = event.status === 'pending' && 
                      (Date.now() - new Date(event.created_at).getTime()) < (30 * 60 * 1000)
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(event.status, event.created_at)} text-white truncate ${
                          event.status === 'pending' ? 'border border-yellow-400' : ''
                        }`}
                        title={`${event.title} - $${event.amount.toLocaleString('es-AR')} - ${
                          event.status === 'confirmed' 
                            ? 'Confirmada' 
                            : isRecentPending 
                              ? 'Pendiente (expira pronto)' 
                              : 'Pendiente de pago'
                        }`}
                      >
                        {event.guest_name}
                        {isRecentPending && <span className="ml-1">⏰</span>}
                      </div>
                    )
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-neutral-400">
                      +{dayEvents.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="p-6 border-t border-neutral-800">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-neutral-300">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded animate-pulse"></div>
            <span className="text-neutral-300">Pendiente reciente ⏰</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded border border-yellow-400"></div>
            <span className="text-neutral-300">Pendiente (expira pronto)</span>
          </div>
          <div className="text-xs text-neutral-500">
            * Solo las confirmadas bloquean disponibilidad permanentemente
          </div>
        </div>
      </div>
    </div>
  )
}