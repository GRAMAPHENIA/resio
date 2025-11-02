'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking } from '@/types/database'
import { Home, Users, Calendar, TrendingUp, LogOut, Plus, Eye, EyeOff, Trash2, X, Menu, ChevronLeft, BookOpen, CheckCircle, MessageCircle, MapPin } from 'lucide-react'
import AdminGuard from '@/components/admin/AdminGuard'
import BookingCalendar from '@/components/admin/BookingCalendar'
import Spinner from '@/components/ui/spinner'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { BookingService, BookingWithProperty } from '@/services/booking.service'

type TabType = 'overview' | 'properties' | 'bookings' | 'pending-bookings' | 'confirmed-bookings' | 'calendar'

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
  const [activeTab, setActiveTab] = useState<TabType>('bookings' as TabType)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  const [pendingBookings, setPendingBookings] = useState<BookingWithProperty[]>([])
  const [confirmedBookings, setConfirmedBookings] = useState<BookingWithProperty[]>([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [bookingToConfirm, setBookingToConfirm] = useState<BookingWithProperty | null>(null)

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

      // Obtener reservas pendientes y confirmadas
      const pendingBookingsData = await BookingService.getPendingBookings()
      const confirmedBookingsData = await BookingService.getConfirmedBookings()

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
      setPendingBookings(pendingBookingsData)
      setConfirmedBookings(confirmedBookingsData)
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

  const openConfirmModal = (booking: BookingWithProperty) => {
    setBookingToConfirm(booking)
    setConfirmModalOpen(true)
  }

  const closeConfirmModal = () => {
    setConfirmModalOpen(false)
    setBookingToConfirm(null)
  }

  const confirmBooking = async () => {
    if (!bookingToConfirm) return

    try {
      await BookingService.confirmBooking(bookingToConfirm.id)
      setNotification({
        message: 'Reserva confirmada exitosamente',
        type: 'success'
      })
      setTimeout(() => setNotification(null), 3000)
      closeConfirmModal()
      // Recargar datos
      fetchData()
    } catch (error) {
      console.error('Error confirming booking:', error)
      setNotification({
        message: 'Error al confirmar la reserva',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const openWhatsApp = (phone: string | undefined, booking: BookingWithProperty) => {
    if (!phone) return
    const message = `Hola ${booking.user_name}, soy del equipo de Resio. Tu reserva para ${booking.property?.name} del ${new Date(booking.start_date).toLocaleDateString('es-AR')} al ${new Date(booking.end_date).toLocaleDateString('es-AR')} está confirmada. ¿Necesitas alguna información adicional?`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
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
                {pendingBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingBookings.length}
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

            {['bookings', 'pending-bookings', 'confirmed-bookings'].includes(activeTab) && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground">Gestión de Reservas</h2>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'bookings'
                          ? 'bg-blue-600/5 text-blue-600 border border-blue-600/20'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700/10'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setActiveTab('pending-bookings')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'pending-bookings'
                          ? 'bg-yellow-600/5 text-yellow-600 border border-yellow-600/20'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700/10'
                      }`}
                    >
                      Pendientes ({pendingBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('confirmed-bookings')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'confirmed-bookings'
                          ? 'bg-green-600/5 text-green-600 border border-green-600/20'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700/10'
                      }`}
                    >
                      Confirmadas ({confirmedBookings.length})
                    </button>
                  </div>
                </div>

                {/* Reservas Pendientes */}
                {activeTab === 'pending-bookings' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Reservas Pendientes</h3>
                    {pendingBookings.length === 0 ? (
                      <div className="bg-neutral-900 border border-neutral-800 p-8 text-center">
                        <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No hay reservas pendientes</h3>
                        <p className="text-neutral-400">Todas las reservas están confirmadas</p>
                      </div>
                    ) : (
                      pendingBookings.map((booking) => (
                        <div key={booking.id} className="bg-neutral-900 border border-neutral-800 p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-foreground mb-1">
                                {booking.property.name}
                              </h4>
                              <div className="flex items-center text-neutral-400 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.property.location}
                              </div>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                              <span className="inline-block px-3 py-1 text-sm font-medium bg-yellow-900 text-yellow-300">
                                Pendiente
                              </span>
                              {booking.user_phone && (
                                <button
                                  onClick={() => openWhatsApp(booking.user_phone, booking)}
                                  className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-neutral-400">Cliente</p>
                              <p className="font-medium text-foreground">{booking.user_name}</p>
                              <p className="text-sm text-neutral-300">{booking.user_email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-400">Entrada</p>
                              <p className="font-medium text-foreground">
                                {new Date(booking.start_date).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-400">Salida</p>
                              <p className="font-medium text-foreground">
                                {new Date(booking.end_date).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                            <div className="text-sm text-neutral-400">
                              Reservado el {new Date(booking.created_at).toLocaleDateString('es-ES')}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-semibold text-foreground">
                                ${booking.amount.toLocaleString()}
                              </span>
                              <button
                                onClick={() => openConfirmModal(booking)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirmar Reserva
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Reservas Confirmadas */}
                {activeTab === 'confirmed-bookings' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Reservas Confirmadas</h3>
                    {confirmedBookings.length === 0 ? (
                      <div className="bg-neutral-900 border border-neutral-800 p-8 text-center">
                        <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No hay reservas confirmadas</h3>
                        <p className="text-neutral-400">Las reservas aparecerán aquí una vez confirmadas</p>
                      </div>
                    ) : (
                      confirmedBookings.map((booking) => (
                        <div key={booking.id} className="bg-neutral-900 border border-neutral-800 p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-foreground mb-1">
                                {booking.property.name}
                              </h4>
                              <div className="flex items-center text-neutral-400 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {booking.property.location}
                              </div>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                              <span className="inline-block px-3 py-1 text-sm font-medium bg-green-900 text-green-300">
                                Confirmada
                              </span>
                              {booking.user_phone && (
                                <button
                                  onClick={() => openWhatsApp(booking.user_phone, booking)}
                                  className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-neutral-400">Cliente</p>
                              <p className="font-medium text-foreground">{booking.user_name}</p>
                              <p className="text-sm text-neutral-300">{booking.user_email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-400">Entrada</p>
                              <p className="font-medium text-foreground">
                                {new Date(booking.start_date).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-400">Salida</p>
                              <p className="font-medium text-foreground">
                                {new Date(booking.end_date).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                            <div className="text-sm text-neutral-400">
                              Reservado el {new Date(booking.created_at).toLocaleDateString('es-ES')}
                              {booking.payment_id && (
                                <span className="ml-2">• ID Pago: {booking.payment_id}</span>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-green-400">
                              ${booking.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Vista general de reservas (por defecto) */}
                {(activeTab === 'bookings' || activeTab === 'overview') && (
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
                )}
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

        {/* Confirm Booking Modal */}
        {confirmModalOpen && bookingToConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Confirmar Reserva</h3>
                <button
                  onClick={closeConfirmModal}
                  className="p-1 hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Propiedad</p>
                  <p className="font-medium text-foreground">{bookingToConfirm.property.name}</p>
                  <p className="text-sm text-neutral-300">{bookingToConfirm.property.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">Cliente</p>
                    <p className="font-medium text-foreground">{bookingToConfirm.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Monto</p>
                    <p className="font-medium text-foreground">${bookingToConfirm.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">Check-in</p>
                    <p className="font-medium text-foreground">
                      {new Date(bookingToConfirm.start_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Check-out</p>
                    <p className="font-medium text-foreground">
                      {new Date(bookingToConfirm.end_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700 p-3">
                  <p className="text-sm text-yellow-300">
                    ¿Estás seguro de que quieres confirmar esta reserva? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 px-4 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
