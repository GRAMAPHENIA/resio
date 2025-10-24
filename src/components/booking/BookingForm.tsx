'use client'

import { useState } from 'react'
import { Property } from '@/types/database'

interface BookingFormProps {
  property: Property
}

export default function BookingForm({ property }: BookingFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    return days > 0 ? days * property.price_per_night : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!startDate || !endDate) {
      setError('Selecciona las fechas de entrada y salida')
      return
    }

    if (!guestName.trim()) {
      setError('Ingresa tu nombre completo')
      return
    }

    if (!guestEmail.trim()) {
      setError('Ingresa tu email')
      return
    }

    if (!guestPhone.trim()) {
      setError('Ingresa tu teléfono')
      return
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      setError('Ingresa un email válido')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      setError('La fecha de salida debe ser posterior a la de entrada')
      return
    }

    if (start < new Date()) {
      setError('La fecha de entrada no puede ser en el pasado')
      return
    }

    setLoading(true)
    setError('')

    try {
      const total = calculateTotal()
      
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          property_name: property.name,
          user_name: guestName,
          user_email: guestEmail,
          user_phone: guestPhone,
          start_date: startDate,
          end_date: endDate,
          amount: total
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la reserva')
      }

      // Redirigir a MercadoPago
      window.location.href = data.init_point

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const total = calculateTotal()
  const days = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">Reservar alojamiento</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-neutral-300 mb-1">
            Fecha de entrada
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
            required
          />
        </div>

        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-neutral-300 mb-1">
            Fecha de salida
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
            required
          />
        </div>

        <div className="border-t border-neutral-700 pt-4">
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Información del huésped</h4>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="guest-name" className="block text-sm font-medium text-neutral-300 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div>
              <label htmlFor="guest-email" className="block text-sm font-medium text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="guest-email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="guest-phone" className="block text-sm font-medium text-neutral-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="guest-phone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-neutral-500"
                placeholder="+54 9 11 1234-5678"
                required
              />
            </div>
          </div>
        </div>

        {total > 0 && (
          <div className="bg-neutral-800 border border-neutral-700 p-4 space-y-2">
            <div className="flex justify-between text-sm text-neutral-300">
              <span>${property.price_per_night.toLocaleString()} × {days} {days === 1 ? 'noche' : 'noches'}</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg text-foreground border-t border-neutral-700 pt-2">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || total <= 0}
          className="w-full bg-foreground text-background py-3 px-4 hover:bg-neutral-200 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Procesando...' : `Reservar por $${total.toLocaleString()}`}
        </button>

        <p className="text-xs text-neutral-500 text-center">
          Al reservar aceptas nuestros términos y condiciones. 
          Recibirás la confirmación por email.
        </p>
      </form>
    </div>
  )
}