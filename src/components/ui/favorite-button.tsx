'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface FavoriteButtonProps {
  propertyId: string
  className?: string
}

export default function FavoriteButton({ propertyId, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // Verificar si la propiedad está en favoritos
    if (typeof window !== 'undefined') {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setIsFavorite(favorites.includes(propertyId))
    }
  }, [propertyId])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault() // Evitar navegación si está dentro de un link
    e.stopPropagation()

    if (typeof window === 'undefined') return

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    if (isFavorite) {
      // Remover de favoritos
      const updatedFavorites = favorites.filter((id: string) => id !== propertyId)
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
      setIsFavorite(false)
    } else {
      // Agregar a favoritos
      const updatedFavorites = [...favorites, propertyId]
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
      setIsFavorite(true)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors ${className}`}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart 
        className={`w-5 h-5 transition-colors ${
          isFavorite 
            ? 'text-foreground fill-current' 
            : 'text-neutral-400 hover:text-foreground'
        }`} 
      />
    </button>
  )
}