import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Home, Plus, Calendar, TrendingUp } from "lucide-react";

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
            <p className="text-3xl font-bold text-blue-400">0</p>
          </div>

          <div className="bg-neutral-900 p-6 border border-neutral-800">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                Ingresos del Mes
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">$0</p>
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

        {/* Actividad reciente */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Actividad Reciente
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-neutral-400 text-center py-8">
              No hay actividad reciente. Comienza agregando tu primera propiedad.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}