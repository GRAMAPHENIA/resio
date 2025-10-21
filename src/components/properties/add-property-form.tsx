'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Save } from 'lucide-react'

export default function AddPropertyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: ''
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verificar si es admin primero
      const isAdminLoggedIn = localStorage.getItem('admin_logged_in')

      if (isAdminLoggedIn) {
        // Admin puede crear propiedades directamente
        const { error } = await supabase
          .from('properties')
          .insert({
            name: formData.title,
            description: formData.description,
            price_per_night: parseFloat(formData.price),
            location: formData.location,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            area: parseFloat(formData.area),
            owner_id: 'admin', // ID especial para admin
            available: false // Inicia como no publicada
          })

        if (error) throw error
        router.push('/admin/dashboard')
      } else {
        // Usuario normal debe estar autenticado
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuario no autenticado')

        const { error } = await supabase
          .from('properties')
          .insert({
            name: formData.title,
            description: formData.description,
            price_per_night: parseFloat(formData.price),
            location: formData.location,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            area: parseFloat(formData.area),
            owner_id: user.id,
            available: false // Inicia como no publicada
          })

        if (error) throw error
        router.push('/propiedades')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear la propiedad')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Plus className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Agregar Propiedad</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Precio por noche ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Habitaciones
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
                min="1"
                className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Baños
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
                min="1"
                className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                min="1"
                className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Amenidades (separadas por comas)
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, Aire acondicionado, Cocina, etc."
              className="w-full bg-neutral-900 border border-neutral-800 text-foreground px-3 py-2 focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Agregar Propiedad'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 border border-neutral-800 text-foreground px-6 py-2 font-medium hover:bg-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}