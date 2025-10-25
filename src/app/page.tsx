import { createClient } from '@/lib/supabase/server'
import Logo from "@/components/ui/logo"
import Link from "next/link"
import Image from "next/image"
import { Home, MapPin, Bed, Bath, Square } from "lucide-react"
import FavoriteButton from '@/components/ui/favorite-button'
import { generateSlug } from '@/utils/slug'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error.message || error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Alojamientos únicos
              <span className="block text-4xl md:text-5xl text-neutral-300 font-normal mt-2">
                reservas simples
              </span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Descubre espacios excepcionales y reserva con total confianza. 
              Sistema directo, sin complicaciones.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 border border-neutral-800 bg-neutral-900/50">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ubicaciones selectas</h3>
              <p className="text-sm text-neutral-400">Propiedades cuidadosamente elegidas en las mejores zonas</p>
            </div>
            
            <div className="text-center p-6 border border-neutral-800 bg-neutral-900/50">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Reserva directa</h3>
              <p className="text-sm text-neutral-400">Sin intermediarios, comunicación directa con propietarios</p>
            </div>
            
            <div className="text-center p-6 border border-neutral-800 bg-neutral-900/50">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center mx-auto mb-4">
                <Square className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Proceso simple</h3>
              <p className="text-sm text-neutral-400">Reserva en pocos pasos, confirmación inmediata</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Alojamientos disponibles
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Cada propiedad ha sido seleccionada por su calidad y ubicación excepcional
            </p>
          </div>

          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 flex flex-col h-full group">
                  {/* Imagen */}
                  <div className="h-72 bg-neutral-800 flex items-center justify-center relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <Home className="w-16 h-16 text-neutral-500" />
                    )}
                    <div className="absolute top-4 right-4">
                      <FavoriteButton propertyId={property.id} />
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-background/90 text-foreground px-3 py-1 text-sm font-medium">
                        ${property.price_per_night.toLocaleString()} / noche
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-foreground leading-tight">
                        {property.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-neutral-400 mb-4">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    <p className="text-neutral-300 mb-6 flex-grow text-sm leading-relaxed line-clamp-3">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between mb-6 text-sm text-neutral-400 border-t border-neutral-800 pt-4">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span>{property.bedrooms} hab</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span>{property.bathrooms} baños</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        <span>{property.area}m²</span>
                      </div>
                    </div>

                    <Link
                      href={`/alojamiento/${property.slug || generateSlug(property.name)}`}
                      className="block w-full text-center bg-foreground text-background py-3 px-4 hover:bg-neutral-200 transition-colors font-medium border border-foreground hover:border-neutral-200"
                    >
                      Ver detalles y reservar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-6">
                  <Home className="w-12 h-12 text-neutral-500" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Próximamente nuevos alojamientos
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Estamos preparando una selección cuidadosa de propiedades excepcionales para tu próxima estadía.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col">
              <Logo className="mb-3" />
              <p className="text-sm text-neutral-400 max-w-md">
                Plataforma de reservas directas para alojamientos únicos. 
                Conectamos huéspedes con propietarios de forma simple y segura.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end gap-3">
              <div className="text-neutral-400 text-sm">
                © 2025 RESIO Alojamientos
              </div>
              <div className="flex items-center gap-4 text-xs">
                <Link
                  href="/admin"
                  className="text-neutral-600 hover:text-neutral-500 transition-colors"
                >
                  v0.2.0
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}