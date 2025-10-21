'use client'

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Plus, Calendar, TrendingUp, Database, Settings, Users, BarChart3, Activity } from "lucide-react";

// Función para generar color único por cliente
function getClientColor(clientEmail: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];
  let hash = 0;
  for (let i = 0; i < clientEmail.length; i++) {
    hash = clientEmail.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function TableroPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    activeBookings: 0,
    pendingRequests: 0,
    totalRevenue: 0
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/registro');
        return;
      }

      setUser(user);
      fetchData(user.id);
    };

    checkAuth();
  }, []);

  const fetchData = async (userId: string) => {
    try {
      const supabase = createClient();

      // Obtener propiedades del usuario
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      const totalProperties = propertiesData?.length || 0;
      const availableProperties = propertiesData?.filter(p => p.available).length || 0;

      // Obtener reservas pagadas de las propiedades del usuario
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            name
          )
        `)
        .eq('properties.owner_id', userId)
        .eq('status', 'paid') // Solo reservas pagadas
        .order('start_date', { ascending: true });

      const activeBookings = bookingsData?.filter(b => b.status === 'paid') || [];
      const totalRevenue = activeBookings.reduce((sum, booking) => sum + booking.amount, 0);

      setStats({
        totalProperties,
        availableProperties,
        activeBookings: activeBookings.length,
        pendingRequests: 0, // Ya no hay solicitudes pendientes
        totalRevenue
      });

      setProperties(propertiesData || []);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'pending' | 'cancelled') => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId)

      if (error) throw error

      // Refresh data
      if (user) {
        fetchData(user.id);
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Error al procesar la solicitud')
    }
  }

  const handleTogglePublish = async (propertyId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('properties')
        .update({ available: !currentStatus })
        .eq('id', propertyId)

      if (error) throw error

      // Refresh data
      if (user) {
        fetchData(user.id);
      }
    } catch (error) {
      console.error('Error updating property:', error)
      alert('Error al actualizar propiedad')
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (error) throw error

      // Refresh data
      if (user) {
        fetchData(user.id);
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Error al eliminar propiedad')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-12">
          <div className="text-neutral-400">Cargando tablero...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Tablero de Propietario</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              Bienvenido, {user?.email}
            </div>
            <button
              onClick={() => router.push('/ingresar')}
              className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
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
              <BarChart3 className="w-5 h-5" />
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
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors ${
                activeTab === 'analytics' ? 'bg-neutral-800 text-foreground' : 'text-neutral-400'
              }`}
            >
              <Activity className="w-5 h-5" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Resumen de tu Negocio</h2>

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
                    <Home className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-foreground">Disponibles</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{stats.availableProperties}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-foreground">Reservas Activas</h3>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{stats.activeBookings}</p>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-foreground">Ingresos Totales</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">${stats.totalRevenue}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-5 h-5 text-foreground" />
                    <h3 className="text-xl font-semibold text-foreground">Mis Propiedades</h3>
                  </div>
                  <p className="text-neutral-400 mb-4">
                    Administra tus propiedades en alquiler
                  </p>
                  <button
                    onClick={() => router.push('/propiedades')}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Ver propiedades
                  </button>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Plus className="w-5 h-5 text-foreground" />
                    <h3 className="text-xl font-semibold text-foreground">Agregar Propiedad</h3>
                  </div>
                  <p className="text-neutral-400 mb-4">
                    Publica una nueva propiedad
                  </p>
                  <button
                    onClick={() => router.push('/propiedades/agregar')}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-foreground" />
                    <h3 className="text-xl font-semibold text-foreground">Reservas</h3>
                  </div>
                  <p className="text-neutral-400 mb-4">
                    Gestiona las reservas activas
                  </p>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Ver reservas
                  </button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {properties.length > 0 ? properties.map((property: any) => (
                        <tr key={property.id} className="hover:bg-neutral-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                            {property.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {property.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            ${property.price_per_night}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              property.available ? 'bg-green-900 text-green-200' : 'bg-gray-900 text-gray-200'
                            }`}>
                              {property.available ? 'Publicada' : 'Borrador'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleTogglePublish(property.id, property.available)}
                                className={`px-2 py-1 text-xs rounded ${
                                  property.available
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {property.available ? 'Despublicar' : 'Publicar'}
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-neutral-400 mb-4">
                              <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">No tienes propiedades creadas</h3>
                              <p className="text-sm">Comienza agregando tu primera propiedad para empezar a recibir reservas.</p>
                            </div>
                            <button
                              onClick={() => router.push('/propiedades/agregar')}
                              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:bg-neutral-200 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar Primera Propiedad
                            </button>
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
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Propiedad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Check-in</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Check-out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {bookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-neutral-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getClientColor(booking.user_email)}`}></div>
                              <div>
                                <div className="font-medium">{booking.user_name}</div>
                                <div className="text-neutral-400">{booking.user_email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {booking.properties?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {new Date(booking.start_date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {new Date(booking.end_date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'paid'
                                ? 'bg-green-900 text-green-200'
                                : booking.status === 'pending'
                                ? 'bg-yellow-900 text-yellow-200'
                                : booking.status === 'request'
                                ? 'bg-orange-900 text-orange-200'
                                : 'bg-red-900 text-red-200'
                            }`}>
                              {booking.status === 'paid' ? 'Pagado' :
                               booking.status === 'pending' ? 'Pendiente' :
                               booking.status === 'request' ? 'Solicitud' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            ${booking.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {booking.status === 'request' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'pending')}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                  title="Aprobar"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                  title="Rechazar"
                                >
                                  ✗
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-neutral-400">
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

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Estadísticas de Ocupación</h3>
                  <p className="text-neutral-400">Funcionalidad próximamente</p>
                </div>
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Ingresos Mensuales</h3>
                  <p className="text-neutral-400">Funcionalidad próximamente</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}