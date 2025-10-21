'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Property } from '@/types/database'

interface SearchBarProps {
  onResults: (properties: Property[]) => void
}

export default function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)

      if (error) throw error
      onResults(data || [])
    } catch (error) {
      console.error('Error searching properties:', error)
      onResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar propiedades por nombre o ubicación..."
          className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 text-foreground placeholder-neutral-400 focus:outline-none focus:border-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-foreground text-background font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}