'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  propertyId: string
  className?: string
}

export default function FavoriteButton({ propertyId, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // Evitar navegación si está dentro de un link
    e.stopPropagation()
    toggleFavorite(propertyId)
  }

  // Evitar problemas de hidratación
  if (!mounted) {
    return (
      <button
        className={`p-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors ${className}`}
        disabled
      >
        <Heart className="w-5 h-5 text-neutral-400" />
      </button>
    )
  }

  const isPropertyFavorite = isFavorite(propertyId)

  return (
    <button
      onClick={handleClick}
      className={`p-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors ${className}`}
      title={isPropertyFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart 
        className={`w-5 h-5 transition-colors ${
          isPropertyFavorite 
            ? 'text-foreground fill-current' 
            : 'text-neutral-400 hover:text-foreground'
        }`} 
      />
    </button>
  )
}