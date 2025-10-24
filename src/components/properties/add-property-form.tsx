'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Save, Upload, X } from 'lucide-react'
import Image from 'next/image'

export default function AddPropertyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
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

  const handleImageUpload = async (files: FileList) => {
    const newImages = Array.from(files)

    // Subir imágenes a Supabase Storage
    const uploadedUrls: string[] = []
    for (const file of newImages) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `properties/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        alert(`Error al subir imagen: ${uploadError.message}`)
        continue
      }

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl)
      }
    }

    setImageUrls(prev => [...prev, ...uploadedUrls])
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

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
             area: parseInt(formData.area),
             images: imageUrls,
             owner_id: null, // Admin crea propiedades sin owner específico
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
            area: parseInt(formData.area),
            images: imageUrls,
            owner_id: user.id,
            available: false // Inicia como no publicada
          })

        if (error) throw error
        router.push('/propiedades')
      }
    } catch (error: unknown) {
      const err = error as Error
      console.error('Error:', error)
      alert(`Error al crear la propiedad: ${err.message || 'Error desconocido'}`)
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
              Fotos de la propiedad
            </label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-neutral-600 p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-400">Haz clic para subir fotos</p>
                  <p className="text-sm text-neutral-500">PNG, JPG, GIF hasta 10MB</p>
                </label>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <div className="w-full h-24 border border-neutral-600 relative">
                        <Image
                          src={url}
                          alt={`Foto ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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