'use client'

import { useState, useEffect, useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Cargar favoritos del localStorage
  const loadFavorites = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem('favorites')
        const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : []
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : [])
      } catch (error) {
        console.error('Error loading favorites:', error)
        setFavorites([])
      }
    }
  }, [])

  // Guardar favoritos en localStorage
  const saveFavorites = useCallback((newFavorites: string[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
        setFavorites(newFavorites)
        
        // Disparar evento personalizado para sincronizar entre componentes
        window.dispatchEvent(new CustomEvent('favoritesChanged', { 
          detail: { favorites: newFavorites } 
        }))
      } catch (error) {
        console.error('Error saving favorites:', error)
      }
    }
  }, [])

  // Verificar si una propiedad está en favoritos
  const isFavorite = useCallback((propertyId: string) => {
    return favorites.includes(propertyId)
  }, [favorites])

  // Agregar a favoritos
  const addFavorite = useCallback((propertyId: string) => {
    if (!favorites.includes(propertyId)) {
      const newFavorites = [...favorites, propertyId]
      saveFavorites(newFavorites)
    }
  }, [favorites, saveFavorites])

  // Remover de favoritos
  const removeFavorite = useCallback((propertyId: string) => {
    const newFavorites = favorites.filter(id => id !== propertyId)
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  // Toggle favorito
  const toggleFavorite = useCallback((propertyId: string) => {
    if (isFavorite(propertyId)) {
      removeFavorite(propertyId)
    } else {
      addFavorite(propertyId)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  // Cargar favoritos al montar el componente
  useEffect(() => {
    setMounted(true)
    loadFavorites()
  }, [loadFavorites])

  // Escuchar cambios en favoritos desde otros componentes
  useEffect(() => {
    const handleFavoritesChanged = (event: CustomEvent) => {
      setFavorites(event.detail.favorites)
    }

    window.addEventListener('favoritesChanged', handleFavoritesChanged as EventListener)
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChanged as EventListener)
    }
  }, [])

  return {
    favorites,
    mounted,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites
  }
}