'use client'


import Image from 'next/image'
import { Property } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { Heart, Calendar, MapPin, Users, Bath, Square } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PropertyCardProps {
  property: Property
  onBook?: (property: Property) => void
}

export default function PropertyCard({ property, onBook }: PropertyCardProps) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const checkIfFavorite = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .single()

    setIsFavorite(!!data)
  }, [user, property.id, supabase])

  useEffect(() => {
    if (user) {
      checkIfFavorite()
    }
  }, [user, checkIfFavorite])

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
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      {property.images && property.images.length > 0 && (
        <div className="relative h-48 mb-4">
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
          />
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-foreground text-foreground' : 'text-white'}`}
            />
          </button>
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground mb-2">{property.name}</h3>

      <div className="flex items-center gap-1 text-neutral-400 mb-2">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">{property.location}</span>
      </div>

      <p className="text-neutral-400 mb-4 line-clamp-2">{property.description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-neutral-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{property.bedrooms} hab</span>
        </div>
        <div className="flex items-center gap-1">
          <Bath className="w-4 h-4" />
          <span>{property.bathrooms} baño</span>
        </div>
        <div className="flex items-center gap-1">
          <Square className="w-4 h-4" />
          <span>{property.area} m²</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {user ? (
          <>
            <span className="text-foreground font-medium">
              ${property.price_per_night} / noche
            </span>
            {onBook && (
              <button
                onClick={() => onBook(property)}
                className="px-4 py-2 bg-foreground text-background font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Reservar
              </button>
            )}
          </>
        ) : (
          <span className="text-neutral-400 text-sm">
            Inicia sesión para ver precios y reservar
          </span>
        )}
      </div>
    </div>
  )
}