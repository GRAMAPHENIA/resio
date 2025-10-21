import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PropertyCard from '@/components/ui/property-card'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'

export default async function FavoritosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/registro')
  }

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      properties (
        *
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching favorites:', error.message || error)
  }

  const favoriteProperties = favorites?.map((fav: any) => fav.properties).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Mis Favoritos</h1>
          </div>
        </div>

        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes propiedades favoritas aún
            </h3>
            <p className="text-neutral-400 mb-6">
              Explora propiedades y haz clic en el corazón para agregarlas a tus favoritos
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2 font-medium hover:bg-neutral-200 transition-colors"
            >
              Explorar Propiedades
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}