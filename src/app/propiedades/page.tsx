import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PropertyCard from '@/components/properties/property-card'
import Link from 'next/link'
import { Plus, Home } from 'lucide-react'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/registro')
  }

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error.message || error)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Mis Propiedades</h1>
          </div>
          <Link
            href="/propiedades/agregar"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2 font-medium hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Propiedad
          </Link>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} isOwner={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes propiedades aún
            </h3>
            <p className="text-neutral-400 mb-6">
              Comienza agregando tu primera propiedad
            </p>
            <Link
              href="/propiedades/agregar"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2 font-medium hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Primera Propiedad
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}