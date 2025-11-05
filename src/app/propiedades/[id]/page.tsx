import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import BookingFormV2 from '@/presentation/components/booking/BookingFormV2'
import { Property } from '@/domain/entities/Property'
import { MapPin, Bed, Bath, Square } from 'lucide-react'

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: propertyData, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !propertyData) {
    notFound()
  }

  // Convert to domain entity
  const property = new Property(
    propertyData.id,
    propertyData.name,
    propertyData.description,
    propertyData.location,
    propertyData.price_per_night,
    propertyData.images || [],
    propertyData.owner_id,
    propertyData.available,
    propertyData.bedrooms,
    propertyData.bathrooms,
    propertyData.area,
    propertyData.slug,
    new Date(propertyData.created_at),
    propertyData.updated_at ? new Date(propertyData.updated_at) : undefined
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de la propiedad */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 overflow-hidden">
              {/* Placeholder para imágenes */}
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Imagen de la propiedad</span>
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {property.name}
                </h1>
                
                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  {property.location}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{property.bedrooms} habitaciones</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{property.bathrooms} baños</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{property.area}m²</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${property.pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-gray-600">por noche</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingFormV2 
                property={property} 
                onSuccess={(bookingId) => {
                  // Redirect to booking success page
                  redirect(`/reservas/exito?booking_id=${bookingId}`)
                }}
                onError={(error) => {
                  console.error('Booking error:', error)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}