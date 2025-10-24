import { createClient } from '@/lib/supabase/server'
import Logo from "@/components/ui/logo"
import Link from "next/link"
import { Home, MapPin, Bed, Bath, Square } from "lucide-react"
import FavoriteButton from '@/components/ui/favorite-button'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error.message || error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size="lg" className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Encuentra tu alojamiento perfecto
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Reserva de forma simple y segura. Disfruta de una experiencia única.
          </p>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div key={property.id} className="bg-neutral-900 border border-neutral-800 overflow-hidden hover:bg-neutral-800 transition-colors flex flex-col h-full">
                  {/* Imagen */}
                  <div className="h-64 bg-neutral-700 flex items-center justify-center relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Home className="w-16 h-16 text-neutral-500" />
                    )}
                    <div className="absolute top-4 right-4">
                      <FavoriteButton propertyId={property.id} />
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {property.name}
                    </h3>
                    
                    <div className="flex items-center text-neutral-400 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    <p className="text-neutral-300 mb-4 flex-grow">
                      {property.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-neutral-400">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        <span>{property.area}m²</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          ${property.price_per_night.toLocaleString()}
                        </span>
                        <span className="text-neutral-400 ml-1">/ noche</span>
                      </div>
                    </div>

                    <Link
                      href={`/alojamiento/${property.id}`}
                      className="block w-full text-center bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium mt-auto"
                    >
                      Ver detalles y reservar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Home className="w-20 h-20 text-neutral-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Próximamente nuevos alojamientos
              </h3>
              <p className="text-neutral-400 max-w-md mx-auto">
                Estamos preparando opciones increíbles para tu próxima estadía.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-neutral-400 text-sm">
                © 2025 RESIO Alojamientos. Sistema de reservas simple y seguro.
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/propiedades"
                  className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
                >
                  Administración
                </Link>
                <span className="text-neutral-700">•</span>
                <span className="text-xs text-neutral-500">v0.2.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}