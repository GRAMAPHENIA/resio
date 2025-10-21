import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Home, Plus, Calendar, TrendingUp } from "lucide-react";

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

export default async function TableroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/registro');
  }

  // Obtener estadísticas básicas
  const { data: properties } = await supabase
    .from('properties')
    .select('id, available')
    .eq('owner_id', user.id);

  const totalProperties = properties?.length || 0;
  const availableProperties = properties?.filter(p => p.available).length || 0;

  // Obtener reservas de las propiedades del usuario
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (
        name
      )
    `)
    .eq('properties.owner_id', user.id)
    .order('start_date', { ascending: true });

  const activeBookings = bookings?.filter(b => b.status === 'paid' || b.status === 'pending' || b.status === 'request') || [];
  const pendingRequests = bookings?.filter(b => b.status === 'request') || [];
  const totalRevenue = activeBookings.reduce((sum, booking) => sum + booking.amount, 0);

  const handleBookingAction = async (bookingId: string, action: 'pending' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId)

      if (error) throw error

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Error al procesar la solicitud')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Tablero de Control
          </h1>
          <p className="text-neutral-400">
            Gestiona tus propiedades y reservas desde aquí
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                Total Propiedades
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalProperties}</p>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-foreground">
                Disponibles
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{availableProperties}</p>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-foreground">
                Reservas Activas
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">{activeBookings.length}</p>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-foreground">
                Solicitudes Pendientes
              </h3>
            </div>
            <p className="text-3xl font-bold text-orange-400">{pendingRequests.length}</p>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                Ingresos Totales
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">${totalRevenue}</p>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-5 h-5 text-foreground" />
              <h3 className="text-xl font-semibold text-foreground">
                Mis Propiedades
              </h3>
            </div>
            <p className="text-neutral-400 mb-4">
              Administra tus propiedades en alquiler
            </p>
            <a 
              href="/propiedades"
              className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Ver propiedades
            </a>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="w-5 h-5 text-foreground" />
              <h3 className="text-xl font-semibold text-foreground">
                Agregar Propiedad
              </h3>
            </div>
            <p className="text-neutral-400 mb-4">
              Publica una nueva propiedad
            </p>
            <a 
              href="/propiedades/agregar"
              className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </a>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-foreground" />
              <h3 className="text-xl font-semibold text-foreground">
                Reservas
              </h3>
            </div>
            <p className="text-neutral-400 mb-4">
              Gestiona las reservas activas
            </p>
            <button className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors">
              <Calendar className="w-4 h-4" />
              Ver reservas
            </button>
          </div>
        </div>

        {/* Planilla de Reservas */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Planilla de Reservas
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {bookings?.map((booking: any) => (
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
                        <div className="flex items-center gap-2">
                          <span>${booking.amount}</span>
                          {booking.status === 'request' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'pending')}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                ✗
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!bookings || bookings.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-neutral-400">
                        No hay reservas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}