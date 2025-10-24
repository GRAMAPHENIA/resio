import { createClient } from '@/lib/supabase/server'
import { Search, Home } from 'lucide-react'

export default async function ExplorarPropiedadesPage() {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">Explorar Propiedades</h1>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">{property.location}</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${property.price_per_night.toLocaleString()}/noche
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{property.bedrooms} hab.</span>
                    <span>{property.bathrooms} baños</span>
                    <span>{property.area}m²</span>
                  </div>
                  <a
                    href={`/propiedades/${property.id}`}
                    className="block w-full text-center bg-gray-900 text-white py-2 px-4 hover:bg-gray-800 transition-colors"
                  >
                    Ver detalles y reservar
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay propiedades disponibles
            </h3>
            <p className="text-gray-600">
              Vuelve pronto para ver nuevas propiedades
            </p>
          </div>
        )}
      </div>
    </div>
  )
}