import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/booking/BookingForm'
import { MapPin, Bed, Bath, Square, Wifi, Car, Coffee, Home } from 'lucide-react'

interface AlojamientoDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AlojamientoDetailPage({ params }: AlojamientoDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del alojamiento */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
              {/* Galería de imágenes */}
              <div className="h-96 bg-neutral-700 flex items-center justify-center">
                <div className="text-center">
                  <Home className="w-20 h-20 text-neutral-500 mx-auto mb-4" />
                  <span className="text-neutral-400 text-lg">Galería de fotos próximamente</span>
                </div>
              </div>
              
              <div className="p-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {property.name}
                </h1>
                
                <div className="flex items-center text-neutral-400 mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{property.location}</span>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center bg-neutral-800 p-4 border border-neutral-700">
                    <Bed className="w-6 h-6 mr-3" />
                    <div>
                      <div className="font-semibold text-foreground">{property.bedrooms}</div>
                      <div className="text-sm text-neutral-400">Habitaciones</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-neutral-800 p-4 border border-neutral-700">
                    <Bath className="w-6 h-6 mr-3" />
                    <div>
                      <div className="font-semibold text-foreground">{property.bathrooms}</div>
                      <div className="text-sm text-neutral-400">Baños</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-neutral-800 p-4 border border-neutral-700">
                    <Square className="w-6 h-6 mr-3" />
                    <div>
                      <div className="font-semibold text-foreground">{property.area}m²</div>
                      <div className="text-sm text-neutral-400">Superficie</div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Descripción</h2>
                  <p className="text-neutral-300 leading-relaxed text-lg">
                    {property.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Servicios incluidos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-neutral-300">
                      <Wifi className="w-5 h-5 mr-2" />
                      <span>WiFi gratuito</span>
                    </div>
                    <div className="flex items-center text-neutral-300">
                      <Car className="w-5 h-5 mr-2" />
                      <span>Estacionamiento</span>
                    </div>
                    <div className="flex items-center text-neutral-300">
                      <Coffee className="w-5 h-5 mr-2" />
                      <span>Cocina equipada</span>
                    </div>
                    <div className="flex items-center text-neutral-300">
                      <Home className="w-5 h-5 mr-2" />
                      <span>Alojamiento completo</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-700 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-4xl font-bold text-foreground">
                        ${property.price_per_night.toLocaleString()}
                      </span>
                      <span className="text-neutral-400 text-xl ml-2">por noche</span>
                    </div>
                    <div className="text-sm text-neutral-500">
                      Precios incluyen limpieza y servicios básicos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingForm property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}