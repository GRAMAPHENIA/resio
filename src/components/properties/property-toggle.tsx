'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PropertyToggleProps {
  propertyId: string
  initialAvailable: boolean
}

export default function PropertyToggle({ propertyId, initialAvailable }: PropertyToggleProps) {
  const [available, setAvailable] = useState(initialAvailable)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggleAvailability = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ available: !available })
        .eq('id', propertyId)

      if (!error) {
        setAvailable(!available)
      }
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleAvailability}
      disabled={loading}
      className={`px-3 py-1 text-sm font-medium transition-colors ${
        available
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-neutral-600 text-neutral-300 hover:bg-neutral-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Actualizando...' : available ? 'Disponible' : 'No disponible'}
    </button>
  )
}