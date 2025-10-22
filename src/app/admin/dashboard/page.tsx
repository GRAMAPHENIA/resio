'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Home, Users, Calendar, TrendingUp, Database, Settings, LogOut, Plus } from 'lucide-react'
import Notification from '@/components/ui/notification'

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
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

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
      console.log('Fetching data from Supabase...')

      // Obtener propiedades con cache busting usando timestamp
      const cacheBuster = Date.now()
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Asegurar que no haya límites

      console.log('Cache buster timestamp:', cacheBuster)

      console.log('Properties data:', propertiesData)
      console.log('Properties error:', propertiesError)

      // Verificar específicamente si la propiedad eliminada sigue existiendo
      if (propertiesData) {
        const deletedPropertyExists = propertiesData.some(p => p.id === '583d4617-2ac4-4eed-b2c0-96c8384cc7a4')
        console.log('Deleted property still exists in data:', deletedPropertyExists)
        console.log('Total properties found:', propertiesData.length)
      }

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError)
      }

      // Obtener bookings de forma simple
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Bookings data:', bookingsData)
      console.log('Bookings error:', bookingsError)

      // Estadísticas simples
      const totalProperties = propertiesData?.length || 0
      const totalBookings = bookingsData?.filter(booking => booking.status === 'paid').length || 0
      const totalRevenue = bookingsData?.reduce((sum, booking) =>
        booking.status === 'paid' ? sum + booking.amount : sum, 0) || 0

      setStats({
        totalProperties,
        totalUsers: 0, // Temporalmente 0 hasta arreglar profiles
        totalBookings,
        totalRevenue
      })

      setProperties(propertiesData || [])
      setBookings(bookingsData || [])
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
              className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
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
                    <Home className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Total Propiedades</h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProperties}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Total Usuarios</h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Total Reservas</h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Ingresos Totales</h3>
                  </div>
                  <p className="text-3xl font-bold text-foreground">${stats.totalRevenue}</p>
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
                                  property.available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
                                    className="px-2 py-1 text-xs bg-foreground text-background rounded hover:bg-neutral-200"
                                  >
                                    Ver calendario
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    try {
                                      const supabase = createClient()
                                      console.log('Attempting to delete property with ID:', property.id)

                                      // Primero verificar si la propiedad existe
                                      const { data: existingProperty, error: fetchError } = await supabase
                                        .from('properties')
                                        .select('id, name')
                                        .eq('id', property.id)
                                        .single()

                                      if (fetchError || !existingProperty) {
                                        console.warn('Property does not exist:', fetchError)
                                        setNotification({
                                          message: 'La propiedad no existe o ya fue eliminada',
                                          type: 'error'
                                        })
                                        // Actualizar estado local de todas formas
                                        setProperties(prev => prev.filter(p => p.id !== property.id))
                                        return
                                      }

                                      console.log('Property exists, proceeding with deletion:', existingProperty)

                                      // Verificar permisos antes de eliminar
                                      console.log('Current user permissions check...')
                                      const { data: { user } } = await supabase.auth.getUser()
                                      console.log('Current user:', user?.id)

                                      const { error: deleteError, data: deleteData } = await supabase
                                        .from('properties')
                                        .delete()
                                        .eq('id', property.id)
                                        .select()

                                      console.log('Delete error:', deleteError)

                                      console.log('Delete operation result:', { error: deleteError, data: deleteData })

                                      if (deleteError) {
                                        console.error('Error deleting property:', deleteError)
                                        setNotification({
                                          message: `Error al eliminar la propiedad: ${deleteError.message}`,
                                          type: 'error'
                                        })
                                      } else if (deleteData && deleteData.length > 0) {
                                        console.log('Property deleted successfully from database:', deleteData)

                                        // Actualizar el estado local inmediatamente
                                        setProperties(prev => {
                                          const filtered = prev.filter(p => p.id !== property.id)
                                          console.log('Local state updated. Properties before:', prev.length, 'after:', filtered.length)
                                          return filtered
                                        })

                                        setNotification({
                                          message: 'Propiedad eliminada exitosamente',
                                          type: 'success'
                                        })

                                        // Intentar recarga inmediata primero
                                        console.log('Attempting immediate re-fetch...')
                                        await fetchData()

                                        // Si aún existe, intentar con delay
                                        setTimeout(async () => {
                                          console.log('Re-fetching data after delay...')
                                          await fetchData()
                                        }, 2000)
                                      } else {
                                        console.warn('Delete operation completed but no data returned')
                                        setNotification({
                                          message: 'La eliminación se completó pero no se confirmó',
                                          type: 'error'
                                        })
                                      }
                                    } catch (error) {
                                      console.error('Unexpected error:', error)
                                      setNotification({
                                        message: 'Error inesperado al eliminar la propiedad',
                                        type: 'error'
                                      })
                                    }
                                  }}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                                >
                                  Eliminar
                                </button>
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
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}