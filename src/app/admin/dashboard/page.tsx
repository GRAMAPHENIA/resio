'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Home, Users, Calendar, TrendingUp, LogOut, Plus, Eye, EyeOff, Trash2, X, Menu, ChevronLeft, BookOpen } from 'lucide-react'
import AdminGuard from '@/components/admin/AdminGuard'
import BookingCalendar from '@/components/admin/BookingCalendar'
import Spinner from '@/components/ui/spinner'
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
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
        <div className="h-screen bg-background overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <Spinner className="text-foreground" />
            <p className="mt-4 text-neutral-400">Cargando panel de administración...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="h-screen bg-background overflow-hidden">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 border ${notification.type === 'success' ? 'bg-green-900 border-green-700 text-green-300' :
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

        <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>
          {/* Sidebar */}
          <div className={`${sidebarExpanded ? 'w-64' : 'w-16'} bg-neutral-900 border-r border-neutral-800 flex-shrink-0 transition-all duration-300 ease-in-out`}>
            {/* Toggle Button */}
            <div className="p-3 border-b border-neutral-800">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="w-full flex items-center justify-center p-2 text-neutral-400 hover:text-foreground hover:bg-neutral-800 transition-colors"
                title={sidebarExpanded ? "Contraer sidebar" : "Expandir sidebar"}
              >
                {sidebarExpanded ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            <nav className="p-2 space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-3 py-3 text-left hover:bg-neutral-800 transition-colors relative ${activeTab === 'overview' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
                  }`}
                title={!sidebarExpanded ? "Resumen" : undefined}
              >
                <TrendingUp className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!sidebarExpanded ? 'mx-auto' : 'ml-0'}`} />
                {sidebarExpanded && (
                  <span className="absolute left-12 whitespace-nowrap opacity-0 animate-fade-in">
                    Resumen
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`w-full flex items-center px-3 py-3 text-left hover:bg-neutral-800 transition-colors relative ${activeTab === 'properties' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
                  }`}
                title={!sidebarExpanded ? "Propiedades" : undefined}
              >
                <Home className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!sidebarExpanded ? 'mx-auto' : 'ml-0'}`} />
                {sidebarExpanded && (
                  <span className="absolute left-12 whitespace-nowrap opacity-0 animate-fade-in">
                    Propiedades
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center px-3 py-3 text-left hover:bg-neutral-800 transition-colors relative ${activeTab === 'bookings' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
                  }`}
                title={!sidebarExpanded ? "Reservas" : undefined}
              >
                <BookOpen className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!sidebarExpanded ? 'mx-auto' : 'ml-0'}`} />
                {sidebarExpanded && (
                  <span className="absolute left-12 whitespace-nowrap opacity-0 animate-fade-in">
                    Reservas
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center px-3 py-3 text-left hover:bg-neutral-800 transition-colors relative ${activeTab === 'calendar' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
                  }`}
                title={!sidebarExpanded ? "Calendario" : undefined}
              >
                <Calendar className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!sidebarExpanded ? 'mx-auto' : 'ml-0'}`} />
                {sidebarExpanded && (
                  <span className="absolute left-12 whitespace-nowrap opacity-0 animate-fade-in">
                    Calendario
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
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
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${property.available ? 'bg-green-900 text-green-300' : 'bg-neutral-700 text-neutral-400'
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
                                    className={`px-2 py-1 text-xs ${property.available
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
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold ${booking.status === 'paid'
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

            {activeTab === 'calendar' && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-8">Calendario de Reservas</h2>

                {/* Filtro por propiedad */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Filtrar por propiedad:
                  </label>
                  <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => {
                      const propertyId = e.target.value
                      setSelectedProperty(propertyId ? properties.find(p => p.id === propertyId) || null : null)
                    }}
                    className="bg-neutral-800 border border-neutral-700 text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-foreground"
                  >
                    <option value="">Todas las propiedades</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calendario */}
                <BookingCalendar
                  bookings={bookings}
                  propertyId={selectedProperty?.id}
                />

                {/* Estadísticas rápidas */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 p-4">
                    <h4 className="text-sm font-medium text-neutral-400 mb-1">Reservas este mes</h4>
                    <p className="text-2xl font-bold text-foreground">
                      {bookings.filter(b => {
                        const bookingDate = new Date(b.start_date)
                        const currentMonth = new Date().getMonth()
                        const currentYear = new Date().getFullYear()
                        return bookingDate.getMonth() === currentMonth &&
                          bookingDate.getFullYear() === currentYear &&
                          b.status === 'paid' &&
                          (!selectedProperty || b.property_id === selectedProperty.id)
                      }).length}
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-4">
                    <h4 className="text-sm font-medium text-neutral-400 mb-1">Ingresos este mes</h4>
                    <p className="text-2xl font-bold text-foreground">
                      ${bookings.filter(b => {
                        const bookingDate = new Date(b.start_date)
                        const currentMonth = new Date().getMonth()
                        const currentYear = new Date().getFullYear()
                        return bookingDate.getMonth() === currentMonth &&
                          bookingDate.getFullYear() === currentYear &&
                          b.status === 'paid' &&
                          (!selectedProperty || b.property_id === selectedProperty.id)
                      }).reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-4">
                    <h4 className="text-sm font-medium text-neutral-400 mb-1">Ocupación promedio</h4>
                    <p className="text-2xl font-bold text-foreground">
                      {(() => {
                        if (selectedProperty) {
                          const propertyBookings = bookings.filter(b => b.property_id === selectedProperty.id && b.status === 'paid').length
                          return propertyBookings > 0 ? Math.round((propertyBookings / 30) * 100) : 0
                        } else {
                          const totalBookings = bookings.filter(b => b.status === 'paid').length
                          const totalProperties = properties.length
                          return totalProperties > 0 ? Math.round((totalBookings / (totalProperties * 30)) * 100) : 0
                        }
                      })()}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Calendar Modal */}
        {selectedProperty && activeTab === 'properties' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Calendario de Reservas - {selectedProperty.name}
                  </h2>
                  <div className="text-sm text-neutral-400 mt-1">
                    <p>Ubicación: {selectedProperty.location} | Precio: ${selectedProperty.price_per_night.toLocaleString()}/noche</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <BookingCalendar
                bookings={bookings}
                propertyId={selectedProperty.id}
              />

              <div className="mt-6 bg-neutral-800 p-4">
                <h3 className="text-lg font-medium text-foreground mb-4">Reservas Confirmadas</h3>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {bookings
                    .filter(b => b.property_id === selectedProperty.id && b.status === 'paid')
                    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .map((booking) => (
                      <div key={booking.id} className="bg-neutral-700 p-3 border border-neutral-600 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-foreground">{booking.user_name}</div>
                          <div className="text-sm text-neutral-400">{booking.user_email}</div>
                          <div className="text-sm text-neutral-300 mt-1">
                            {new Date(booking.start_date).toLocaleDateString('es-ES')} - {new Date(booking.end_date).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-400">${booking.amount.toLocaleString()}</div>
                          <div className="text-xs text-green-300">Confirmado</div>
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
        )}
      </div>
    </AdminGuard>
  )
}