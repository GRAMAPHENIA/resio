'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Home, Users, Calendar, TrendingUp, LogOut, Plus, Eye, EyeOff, Trash2, X } from 'lucide-react'
import AdminGuard from '@/components/admin/AdminGuard'
import Logo from '@/components/ui/logo'
import Link from 'next/link'

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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Obtener propiedades
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError)
      }

      // Obtener reservas
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
      }

      // Calcular estadísticas
      const totalProperties = propertiesData?.length || 0
      const totalBookings = bookingsData?.filter(booking => booking.status === 'paid').length || 0
      const totalRevenue = bookingsData?.reduce((sum, booking) =>
        booking.status === 'paid' ? sum + booking.amount : sum, 0) || 0

      setStats({
        totalProperties,
        totalUsers: 0, // Placeholder
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
    localStorage.removeItem('adminSession')
    router.push('/admin/login')
  }

  const togglePropertyAvailability = async (propertyId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('properties')
        .update({ available: !currentStatus })
        .eq('id', propertyId)

      if (!error) {
        setProperties(prev => prev.map(p =>
          p.id === propertyId ? { ...p, available: !currentStatus } : p
        ))
        setNotification({
          message: `Propiedad ${!currentStatus ? 'publicada' : 'despublicada'} exitosamente`,
          type: 'success'
        })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Error updating property:', error)
      setNotification({
        message: 'Error al actualizar la propiedad',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (!error) {
        setProperties(prev => prev.filter(p => p.id !== propertyId))
        setNotification({
          message: 'Propiedad eliminada exitosamente',
          type: 'success'
        })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      setNotification({
        message: 'Error al eliminar la propiedad',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-background p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
            <p className="mt-2 text-neutral-400">Cargando panel de administración...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 border ${
            notification.type === 'success' ? 'bg-green-900 border-green-700 text-green-300' :
            notification.type === 'error' ? 'bg-red-900 border-red-700 text-red-300' :
            'bg-blue-900 border-blue-700 text-blue-300'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <Logo size="sm" />
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
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
                      <h3 className="text-lg font-semibold text-foreground">Propiedades</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.totalProperties}</p>
                  </div>

                  <div className="bg-neutral-900 p-6 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Usuarios</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                  </div>

                  <div className="bg-neutral-900 p-6 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Reservas</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
                  </div>

                  <div className="bg-neutral-900 p-6 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Ingresos</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
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
                
                <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Ubicación</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Precio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Reservas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {properties.map((property) => {
                          const propertyBookings = bookings.filter(b => b.property_id === property.id && b.status === 'paid')
                          return (
                            <tr key={property.id} className="hover:bg-neutral-800/50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">{property.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{property.location}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${property.price_per_night.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                                  property.available ? 'bg-green-900 text-green-300' : 'bg-neutral-700 text-neutral-400'
                                }`}>
                                  {property.available ? 'Publicada' : 'Borrador'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                <div className="flex items-center gap-2">
                                  <span>{propertyBookings.length}</span>
                                  {propertyBookings.length > 0 && (
                                    <button
                                      onClick={() => setSelectedProperty(property)}
                                      className="px-2 py-1 text-xs bg-foreground text-background hover:bg-neutral-200"
                                    >
                                      Ver calendario
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => togglePropertyAvailability(property.id, property.available)}
                                    className={`px-2 py-1 text-xs ${
                                      property.available
                                        ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                                        : 'bg-green-900 text-green-300 hover:bg-green-800'
                                    }`}
                                  >
                                    {property.available ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                  <button
                                    onClick={() => deleteProperty(property.id)}
                                    className="px-2 py-1 text-xs bg-red-900 text-red-300 hover:bg-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
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

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-8">Gestión de Reservas</h2>
                <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
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
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-neutral-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {properties.find(p => p.id === booking.property_id)?.name || 'N/A'}
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
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                                booking.status === 'paid'
                                  ? 'bg-green-900 text-green-300'
                                  : booking.status === 'pending'
                                  ? 'bg-yellow-900 text-yellow-300'
                                  : 'bg-red-900 text-red-300'
                              }`}>
                                {booking.status === 'paid' ? 'Pagado' :
                                 booking.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              ${booking.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
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
                  className="p-1 hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-neutral-400 mb-4">
                  <p>Ubicación: {selectedProperty.location}</p>
                  <p>Precio por noche: ${selectedProperty.price_per_night.toLocaleString()}</p>
                </div>

                <div className="bg-neutral-800 p-4">
                  <h3 className="text-lg font-medium text-foreground mb-4">Reservas Confirmadas</h3>
                  <div className="space-y-3">
                    {bookings
                      .filter(b => b.property_id === selectedProperty.id && b.status === 'paid')
                      .map((booking) => (
                        <div key={booking.id} className="bg-neutral-700 p-3 border border-neutral-600">
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
                              <div className="font-medium text-green-400">${booking.amount.toLocaleString()}</div>
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
    </AdminGuard>
  )
}