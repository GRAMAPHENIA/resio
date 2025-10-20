import { Property } from '@/types/database'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
      <div className="h-48 bg-neutral-800 flex items-center justify-center">
        <span className="text-neutral-500">Sin imagen</span>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {property.title}
        </h3>
        
        <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-foreground font-bold text-lg">
            ${property.price}/noche
          </span>
          <span className="text-neutral-400 text-sm">
            {property.location}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
          <span>{property.bedrooms} hab.</span>
          <span>{property.bathrooms} baños</span>
          <span>{property.area} m²</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 ${
            property.available 
              ? 'bg-green-900 text-green-300' 
              : 'bg-red-900 text-red-300'
          }`}>
            {property.available ? 'Disponible' : 'No disponible'}
          </span>
          
          <button className="bg-foreground text-background px-4 py-1 text-sm font-medium hover:bg-neutral-200 transition-colors">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  )
}