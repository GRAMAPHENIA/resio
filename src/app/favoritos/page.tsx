'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Home, MapPin, Heart } from 'lucide-react'
import { Property } from '@/types/database'
import { generateSlug } from '@/utils/slug'
import { useFavorites } from '@/hooks/useFavorites'
import Spinner from '@/components/ui/spinner'

export default function FavoritosPage() {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const { favorites, removeFavorite, mounted } = useFavorites()
  const supabase = createClient()

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Esperar a que el componente esté montado
        if (!mounted) {
          return
        }

        // Si no hay favoritos, mostrar página vacía
        if (favorites.length === 0) {
          setLoading(false)
          setFavoriteProperties([])
          return
        }

        setLoading(true)

        // Obtener las propiedades favoritas de la base de datos
        const { data: properties, error } = await supabase
          .from('properties')
          .select('*')
          .in('id', favorites)
          // No filtrar por available para mostrar todas las propiedades favoritas

        if (!error && properties) {
          // Ordenar las propiedades según el orden en favorites
          const orderedProperties = favorites
            .map(id => properties.find(prop => prop.id === id))
            .filter(Boolean) as Property[]
          
          setFavoriteProperties(orderedProperties)
        } else {
          console.error('Error fetching properties:', error)
          setFavoriteProperties([])
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
        setFavoriteProperties([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [supabase, favorites, mounted])

  const handleRemoveFavorite = (propertyId: string) => {
    removeFavorite(propertyId)
    setFavoriteProperties(prev => prev.filter(prop => prop.id !== propertyId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="text-foreground" />
          <p className="mt-6 text-neutral-400 text-lg">Cargando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>

        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((property) => (
              <div key={property.id} className="bg-neutral-900 border border-neutral-800 overflow-hidden hover:bg-neutral-800 transition-colors flex flex-col h-full">
                <div className="h-48 bg-neutral-700 flex items-center justify-center relative">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <Home className="w-12 h-12 text-neutral-500" />
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(property.id)}
                    className="absolute top-3 right-3 p-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-foreground fill-current" />
                  </button>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {property.name}
                  </h3>

                  <div className="flex items-center text-neutral-400 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <p className="text-neutral-300 mb-4 flex-grow">
                    {property.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      ${property.price_per_night.toLocaleString()}
                    </span>
                    <span className="text-neutral-400">/ noche</span>
                  </div>

                  <Link
                    href={`/alojamiento/${property.slug || generateSlug(property.name)}`}
                    className="block w-full text-center bg-foreground text-background py-2 px-4 hover:bg-neutral-200 transition-colors font-medium mt-auto"
                  >
                    Ver detalles y reservar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-20 h-20 text-neutral-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              No tienes alojamientos favoritos aún
            </h3>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              Explora nuestros alojamientos y haz clic en el corazón para agregarlos a tus favoritos
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 hover:bg-neutral-200 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Ver alojamientos
            </Link>
          </div>
        )}
      </div>
      

    </div>
  )
}