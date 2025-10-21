'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Home, Users, Calendar, TrendingUp, Database, Settings, LogOut, Plus } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0
  })
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    // Verificar autenticación de admin
    const isAdminLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isAdminLoggedIn) {
      router.push('/admin')
      return
    }

    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Obtener estadísticas
      const [propertiesRes, usersRes, bookingsRes] = await Promise.all([
        supabase.from('properties').select('id, price'),
        supabase.from('profiles').select('id'),
        supabase.from('bookings').select('id, amount, status')
      ])

      const totalProperties = propertiesRes.data?.length || 0
      const totalUsers = usersRes.data?.length || 0
      const totalBookings = bookingsRes.data?.length || 0
      const totalRevenue = bookingsRes.data?.reduce((sum, booking) =>
        booking.status === 'paid' ? sum + booking.amount : sum, 0) || 0

      setStats({
        totalProperties,
        totalUsers,
        totalBookings,
        totalRevenue
      })

      // Obtener datos detallados
      const [propertiesData, bookingsData] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select(`
          *,
          properties (
            name,
            location
          ),
          profiles (
            full_name,
            email
          )
        `).order('created_at', { ascending: false })
      ])

      setProperties(propertiesData.data || [])
      setBookings(bookingsData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-12">
          <div className="text-neutral-400">Cargando panel de administración...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '0' }}>
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">Admin</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-neutral-900 border-r border-neutral-800 min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors ${
                activeTab === 'overview' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors ${
                activeTab === 'properties' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
              }`}
            >
              <Home className="w-5 h-5" />
              Propiedades
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors ${
                activeTab === 'users' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
              }`}
            >
              <Users className="w-5 h-5" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors ${
                activeTab === 'bookings' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Reservas
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Resumen del Sistema</h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-foreground">Total Propiedades</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalProperties}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-foreground">Total Usuarios</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{stats.totalUsers}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-foreground">Total Reservas</h3>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{stats.totalBookings}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-foreground">Ingresos Totales</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">${stats.totalRevenue}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">Gestión de Propiedades</h2>
                <button
                  onClick={() => router.push('/propiedades/agregar')}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Propiedad
                </button>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Ubicación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Dueño</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Reservas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {properties.map((property) => {
                        const propertyBookings = bookings.filter(b => b.property_id === property.id && b.status === 'paid');
                        return (
                          <tr key={property.id} className="hover:bg-neutral-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">{property.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{property.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${property.price_per_night}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                property.available ? 'bg-green-900 text-green-200' : 'bg-gray-900 text-gray-200'
                              }`}>
                                {property.available ? 'Publicada' : 'Borrador'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{property.owner_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              <div className="flex items-center gap-2">
                                <span>{propertyBookings.length}</span>
                                {propertyBookings.length > 0 && (
                                  <button
                                    onClick={() => setSelectedProperty(property)}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Ver calendario
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {properties.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-neutral-400">
                            No hay propiedades registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Gestión de Usuarios</h2>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Fecha Registro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {/* Los usuarios se mostrarían aquí - necesitaríamos obtenerlos de profiles */}
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-neutral-400">
                          Funcionalidad de usuarios próximamente
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Gestión de Reservas</h2>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Propiedad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Fechas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {bookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-neutral-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {booking.properties?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            <div>
                              <div className="font-medium">{booking.user_name}</div>
                              <div className="text-neutral-400">{booking.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            <div>
                              <div>Desde: {new Date(booking.start_date).toLocaleDateString()}</div>
                              <div>Hasta: {new Date(booking.end_date).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'paid'
                                ? 'bg-green-900 text-green-200'
                                : booking.status === 'pending'
                                ? 'bg-yellow-900 text-yellow-200'
                                : 'bg-red-900 text-red-200'
                            }`}>
                              {booking.status === 'paid' ? 'Pagado' :
                               booking.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            ${booking.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Calendar Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Calendario de Reservas - {selectedProperty.name}
              </h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1 hover:bg-neutral-800 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-neutral-400 mb-4">
                <p>Ubicación: {selectedProperty.location}</p>
                <p>Precio por noche: ${selectedProperty.price_per_night}</p>
              </div>

              <div className="bg-neutral-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-4">Reservas Confirmadas</h3>
                <div className="space-y-3">
                  {bookings
                    .filter(b => b.property_id === selectedProperty.id && b.status === 'paid')
                    .map((booking) => (
                      <div key={booking.id} className="bg-neutral-700 p-3 rounded border border-neutral-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-foreground">{booking.user_name}</div>
                            <div className="text-sm text-neutral-400">{booking.user_email}</div>
                            <div className="text-sm text-neutral-300 mt-1">
                              Desde: {new Date(booking.start_date).toLocaleDateString('es-ES')} -
                              Hasta: {new Date(booking.end_date).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-400">${booking.amount}</div>
                            <div className="text-xs text-green-300">Pagado</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {bookings.filter(b => b.property_id === selectedProperty.id && b.status === 'paid').length === 0 && (
                    <div className="text-center py-8 text-neutral-400">
                      No hay reservas confirmadas para esta propiedad
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}