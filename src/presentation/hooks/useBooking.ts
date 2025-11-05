'use client'

import { useState, useCallback } from 'react'

interface BookingData {
  id: string
  propertyId: string
  contactInfo: {
    name: string
    email: string
    phone?: string
  }
  dateRange: {
    startDate: string
    endDate: string
    nights: number
    formatted: string
  }
  amount: number
  status: {
    value: string
    display: string
    color: string
  }
  bookingCode: string
  canCancel: boolean
  canCompletePayment: boolean
  createdAt: string
}

interface PropertyData {
  id: string
  name: string
  description: string
  location: string
  pricePerNight: number
  images: string[]
  bedrooms: number
  bathrooms: number
  area: number
}

interface BookingWithProperty {
  booking: BookingData
  property: PropertyData
}

export function useBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getBooking = useCallback(async (bookingId: string): Promise<BookingWithProperty | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener la reserva')
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserBookings = useCallback(async (params: { email?: string; userId?: string }): Promise<BookingData[]> => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params.email) searchParams.append('email', params.email)
      if (params.userId) searchParams.append('userId', params.userId)

      const response = await fetch(`/api/v2/bookings?${searchParams.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener las reservas')
      }

      return result.data.bookings
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const completePayment = useCallback(async (bookingId: string, paymentId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete_payment',
          payment_id: paymentId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al completar el pago')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<{ success: boolean; refundAmount?: number }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          reason
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al cancelar la reserva')
      }

      return {
        success: true,
        refundAmount: result.data.refundAmount
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado'
      setError(errorMessage)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getBooking,
    getUserBookings,
    completePayment,
    cancelBooking,
    clearError: () => setError(null)
  }
}