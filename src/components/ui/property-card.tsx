'use client'

import Image from 'next/image'
import { Property } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { Heart, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
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
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      {property.image_url && (
        <div className="relative h-48 mb-4">
          <Image
            src={property.image_url}
            alt={property.name}
            fill
            className="object-cover rounded"
          />
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-foreground text-foreground' : 'text-white'}`}
            />
          </button>
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground mb-2">{property.name}</h3>
      <p className="text-neutral-400 mb-2">{property.location}</p>
      <p className="text-neutral-400 mb-4 line-clamp-2">{property.description}</p>
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