'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/admin/AdminGuard'
import { Property } from '@/types/database'
import { Home, Plus, LogOut, Eye, EyeOff } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (propertyId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('properties')
        .update({ available: !currentStatus })
        .eq('id', propertyId)

      if (!error) {
        setProperties(prev => prev.map(p =>
          p.id === propertyId ? { ...p, available: !currentStatus } : p
        ))
      }
    } catch (error) {
      console.error('Error updating property:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
            <p className="mt-2 text-neutral-400">Cargando...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Propiedades</h2>
            <button
              onClick={() => router.push('/propiedades/agregar')}
              className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 font-medium hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Propiedad
            </button>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-neutral-900 border border-neutral-800 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {property.name}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-4">
                    {property.location}
                  </p>
                  <p className="text-foreground font-bold mb-4">
                    ${property.price_per_night.toLocaleString()}/noche
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium ${
                      property.available 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-neutral-700 text-neutral-400'
                    }`}>
                      {property.available ? 'Publicada' : 'Borrador'}
                    </span>
                    
                    <button
                      onClick={() => toggleAvailability(property.id, property.available)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      {property.available ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {property.available ? 'Ocultar' : 'Publicar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay propiedades
              </h3>
              <p className="text-neutral-400 mb-6">
                Comienza agregando tu primera propiedad
              </p>
              <button
                onClick={() => router.push('/propiedades/agregar')}
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:bg-neutral-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Primera Propiedad
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}