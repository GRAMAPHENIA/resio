'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Calendar, X } from 'lucide-react'

interface BookingFormProps {
  property: Property
  onClose: () => void
  onSuccess: (preferenceId: string) => void
}

export default function BookingForm({ property, onClose, onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    start_date: '',
    end_date: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState(0)
  const [bookedDates, setBookedDates] = useState<Booking[]>([])
  const [currentStep, setCurrentStep] = useState<'calendar' | 'form'>('calendar')

  useEffect(() => {
    // Load user data from localStorage
    const savedName = localStorage.getItem('user_name')
    const savedEmail = localStorage.getItem('user_email')
    if (savedName) setFormData(prev => ({ ...prev, user_name: savedName }))
    if (savedEmail) setFormData(prev => ({ ...prev, user_email: savedEmail }))

    // Load booked dates for this property
    loadBookedDates()
  }, [property.id, loadBookedDates])

  useEffect(() => {
    // Calculate amount when dates change
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (nights > 0) {
        setAmount(nights * property.price_per_night)
      }
    }
  }, [formData.start_date, formData.end_date, property.price_per_night])

  const loadBookedDates = useCallback(async () => {
    const supabase = createClient()
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', property.id)
      .neq('status', 'cancelled')

    if (bookings) {
      setBookedDates(bookings)
    }
  }, [property.id])

  const handleDateSelect = (startDate: string, endDate: string) => {
    setFormData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }))
    setCurrentStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.user_name || !formData.user_email || !formData.start_date || !formData.end_date) return

    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('user_name', formData.user_name)
      localStorage.setItem('user_email', formData.user_email)

      // Insert booking with status 'pending' for immediate payment
      const supabase = createClient()
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          user_name: formData.user_name,
          user_email: formData.user_email,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: 'pending', // Status for payment
          amount
        })
        .select()
        .single()

      if (error) throw error

      // Create Mercado Pago preference for immediate payment
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          amount,
          property_name: property.name,
          user_name: formData.user_name,
          user_email: formData.user_email
        })
      })

      if (!response.ok) throw new Error('Error creating payment preference')

      const { preferenceId } = await response.json()
      onSuccess(preferenceId)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error al crear la reserva. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Reservar {property.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentStep === 'calendar' ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">Selecciona tus fechas</h3>
              <p className="text-neutral-400 text-sm">Elige check-in y check-out para ver disponibilidad</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de entrada</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-foreground"
                  style={{ colorScheme: 'dark' }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de salida</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-foreground"
                  style={{ colorScheme: 'dark' }}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {bookedDates.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700 p-3">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Fechas ocupadas: {bookedDates.map(b => `${new Date(b.start_date).toLocaleDateString()} - ${new Date(b.end_date).toLocaleDateString()}`).join(', ')}</span>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep('form')}
                className="px-6 py-2 bg-neutral-800 text-foreground hover:bg-neutral-700 transition-colors"
              >
                Continuar sin seleccionar fechas
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setCurrentStep('calendar')}
                className="text-neutral-400 hover:text-foreground transition-colors"
              >
                ← Volver a calendario
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha de entrada</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-foreground"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha de salida</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-foreground focus:outline-none focus:border-foreground"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
            </div>

            {amount > 0 && (
              <div className="bg-green-900/20 border border-green-700 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-medium">Resumen de la reserva</span>
                  <span className="text-foreground font-bold text-lg">${amount}</span>
                </div>
                <div className="text-sm text-neutral-400 mt-1">
                  {Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))} noches × ${property.price_per_night}/noche
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-neutral-700 text-foreground hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-foreground text-background font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Procesando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}