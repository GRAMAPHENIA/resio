'use client'

import { useState } from 'react'
import { Property } from '@/domain/entities/Property'

interface BookingFormV2Props {
  property: Property
  onSuccess?: (bookingId: string) => void
  onError?: (error: string) => void
}

interface FormData {
  name: string
  email: string
  phone: string
  startDate: string
  endDate: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  startDate?: string
  endDate?: string
  general?: string
}

export default function BookingFormV2({ property, onSuccess, onError }: BookingFormV2Props) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const calculateNights = (): number => {
    if (!formData.startDate || !formData.endDate) return 0
    
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const timeDiff = end.getTime() - start.getTime()
    
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = (): number => {
    const nights = calculateNights()
    return nights > 0 ? nights * property.pricePerNight : 0
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de entrada es requerida'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de salida es requerida'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        newErrors.startDate = 'La fecha de entrada no puede ser en el pasado'
      }

      if (start >= end) {
        newErrors.endDate = 'La fecha de salida debe ser posterior a la de entrada'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/v2/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          user_name: formData.name.trim(),
          user_email: formData.email.trim().toLowerCase(),
          user_phone: formData.phone.trim(),
          start_date: formData.startDate,
          end_date: formData.endDate
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al crear la reserva')
      }

      // Success - booking created
      const bookingId = result.data.booking.id
      onSuccess?.(bookingId)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado'
      setErrors({ general: errorMessage })
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const nights = calculateNights()
  const total = calculateTotal()

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Reservar {property.name}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-300">
            Información de contacto
          </h4>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 bg-neutral-800 border text-foreground focus:outline-none focus:border-neutral-500 ${
                errors.name ? 'border-red-500' : 'border-neutral-700'
              }`}
              placeholder="Tu nombre completo"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 bg-neutral-800 border text-foreground focus:outline-none focus:border-neutral-500 ${
                errors.email ? 'border-red-500' : 'border-neutral-700'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 bg-neutral-800 border text-foreground focus:outline-none focus:border-neutral-500 ${
                errors.phone ? 'border-red-500' : 'border-neutral-700'
              }`}
              placeholder="+54 9 11 1234-5678"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="border-t border-neutral-700 pt-4 space-y-4">
          <h4 className="text-sm font-medium text-neutral-300">
            Fechas de estadía
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-neutral-300 mb-1">
                Entrada *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 bg-neutral-800 border text-foreground focus:outline-none focus:border-neutral-500 ${
                  errors.startDate ? 'border-red-500' : 'border-neutral-700'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-neutral-300 mb-1">
                Salida *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 bg-neutral-800 border text-foreground focus:outline-none focus:border-neutral-500 ${
                  errors.endDate ? 'border-red-500' : 'border-neutral-700'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        {total > 0 && (
          <div className="bg-neutral-800 border border-neutral-700 p-4 space-y-2">
            <div className="flex justify-between text-sm text-neutral-300">
              <span>
                ${property.pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'noche' : 'noches'}
              </span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg text-foreground border-t border-neutral-700 pt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3 rounded">
            {errors.general}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || total <= 0}
          className="w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Procesando...' : `Reservar por $${total.toLocaleString()}`}
        </button>

        <p className="text-xs text-neutral-500 text-center">
          Al reservar aceptas nuestros términos y condiciones. 
          Recibirás la confirmación por email.
        </p>
      </form>
    </div>
  )
}