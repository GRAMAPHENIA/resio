'use client'

import { Property } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { Heart, Calendar, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PropertyToggle from './property-toggle'
import Link from 'next/link'

interface PropertyCardProps {
  property: Property
  onBook?: (property: Property) => void
  isOwner?: boolean
}

export default function PropertyCard({ property, onBook, isOwner = false }: PropertyCardProps) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkIfFavorite()
    }
  }, [user, property.id])

  const checkIfFavorite = async () => {
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .single()

    setIsFavorite(!!data)
  }

  const toggleFavorite = async () => {
    if (!user) {
      // Redirigir al login si no está autenticado
      window.location.href = '/ingresar'
      return
    }

    setIsLoading(true)
    try {
      if (isFavorite) {
        // Remover de favoritos
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)
        setIsFavorite(false)
      } else {
        // Agregar a favoritos
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: property.id
          })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-neutral-800 flex items-center justify-center">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-neutral-500">Sin imagen</span>
        )}
        {!isOwner && (
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-foreground text-foreground' : 'text-white'}`}
            />
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {property.name}
        </h3>

        <p className="text-neutral-400 text-sm mb-3 flex-grow">
          {property.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-foreground font-bold text-lg">
            ${property.price_per_night.toLocaleString()}/noche
          </span>
          <span className="text-neutral-400 text-sm">
            {property.location}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {isOwner ? (
            <PropertyToggle 
              propertyId={property.id} 
              initialAvailable={property.available} 
            />
          ) : (
            <span className={`text-xs px-2 py-1 ${
              property.available 
                ? 'bg-green-900 text-green-300' 
                : 'bg-neutral-700 text-neutral-400'
            }`}>
              {property.available ? 'Disponible' : 'No disponible'}
            </span>
          )}

          {isOwner ? (
            <Link
              href={`/propiedades/${property.id}/editar`}
              className="bg-neutral-700 text-neutral-300 px-4 py-1 text-sm font-medium hover:bg-neutral-600 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Editar
            </Link>
          ) : (
            <button
              onClick={() => onBook?.(property)}
              className="bg-foreground text-background px-4 py-1 text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reservar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}