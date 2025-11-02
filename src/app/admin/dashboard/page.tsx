'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Home, X } from 'lucide-react'
import AdminGuard from '@/components/admin/AdminGuard'
import BookingCalendar from '@/components/admin/BookingCalendar'
import { Booking, Property } from '@/types/database'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'properties'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Simulación de datos para ejemplo local (puede reemplazarse por fetch)
  useEffect(() => {
    const sampleProperties: Property[] = [
      {
        id: '1',
        name: 'Casa del Lago',
        description: 'Hermosa casa junto al lago',
        location: 'Lago Nahuel Huapi',
        price_per_night: 15000,
        images: [],
        owner_id: 'admin',
        available: true,
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Cabaña del Bosque',
        description: 'Cabaña acogedora en el bosque',
        location: 'Bosque Andino',
        price_per_night: 12000,
        images: [],
        owner_id: 'admin',
        available: true,
        bedrooms: 2,
        bathrooms: 1,
        area: 80,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Departamento Urbano',
        description: 'Moderno departamento en la ciudad',
        location: 'Centro de Buenos Aires',
        price_per_night: 18000,
        images: [],
        owner_id: 'admin',
        available: true,
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        created_at: new Date().toISOString()
      }
    ]
    const sampleBookings: Booking[] = [
      {
        id: '101',
        property_id: '1',
        user_name: 'Juan Pérez',
        user_email: 'juan@example.com',
        start_date: '2025-11-01',
        end_date: '2025-11-05',
        status: 'paid',
        amount: 45000,
        created_at: new Date().toISOString()
      },
      {
        id: '102',
        property_id: '2',
        user_name: 'María Gómez',
        user_email: 'maria@example.com',
        start_date: '2025-11-10',
        end_date: '2025-11-15',
        status: 'pending',
        amount: 32000,
        created_at: new Date().toISOString()
      }
    ]
    setProperties(sampleProperties)
    setBookings(sampleBookings)
  }, [])

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-950 text-foreground p-6">
        <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="inline w-4 h-4 mr-2" />
              Reservas
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'properties'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Home className="inline w-4 h-4 mr-2" />
              Propiedades
            </button>
          </div>
        </header>

        <div className="space-y-10">
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Reservas</h2>
              <div className="overflow-hidden border border-neutral-800 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-800">
                    <thead className="bg-neutral-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Propiedad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Fechas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {bookings.map((booking) => {
                        const property = properties.find(p => p.id === booking.property_id)
                        return (
                          <tr key={booking.id} className="hover:bg-neutral-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                              {property ? property.name : 'Propiedad eliminada'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {booking.user_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {new Date(booking.start_date).toLocaleDateString('es-ES')} - {new Date(booking.end_date).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                  booking.status === 'paid'
                                    ? 'bg-green-900 text-green-300'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-900 text-yellow-300'
                                    : 'bg-neutral-700 text-neutral-400'
                                }`}
                              >
                                {booking.status === 'paid'
                                  ? 'Confirmada'
                                  : booking.status === 'pending'
                                  ? 'Pendiente'
                                  : 'Cancelada'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              ${booking.amount.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-neutral-400">
                            No hay reservas registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">Propiedades</h2>
                <button className="flex items-center px-3 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar propiedad
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="border border-neutral-800 rounded-lg p-4 bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{property.name}</h3>
                    <p className="text-sm text-neutral-400">ID: {property.id}</p>
                  </div>
                ))}
              </div>
              {properties.length === 0 && (
                <p className="text-neutral-400 text-center mt-10">No hay propiedades registradas</p>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Calendario de Reservas</h2>
              <BookingCalendar bookings={bookings} />
            </div>
          )}
        </div>

        {selectedProperty && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl p-6 relative rounded-lg">
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-3 right-3 text-neutral-400 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Calendario de {selectedProperty.name}
              </h3>
              <BookingCalendar
                bookings={bookings.filter(b => b.property_id === selectedProperty.id)}
                propertyId={selectedProperty.id}
              />
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
