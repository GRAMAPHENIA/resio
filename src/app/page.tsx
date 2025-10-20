
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/ui/logo";
import Link from "next/link";
import { Plus, Calendar, BarChart3, Search, MapPin, Users } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Logo size="lg" className="mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Gestiona tus propiedades
            </h1>
            <div className="max-w-5xl mx-auto mb-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                <div className="relative border border-neutral-800">
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="¿Dónde?"
                    className="w-full pl-4 pr-10 py-4 bg-transparent text-foreground placeholder-neutral-400 focus:outline-none"
                  />
                </div>
                <div className="relative border border-neutral-800 border-l-0">
                  <label className="absolute left-3 top-2 text-xs text-neutral-400 font-medium">INGRESO</label>
                  <input
                    type="date"
                    className="w-full pt-6 pb-2 pl-3 pr-4 bg-transparent text-foreground focus:outline-none"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div className="relative border border-neutral-800 border-l-0">
                  <label className="absolute left-3 top-2 text-xs text-neutral-400 font-medium">SALIDA</label>
                  <input
                    type="date"
                    className="w-full pt-6 pb-2 pl-3 pr-4 bg-transparent text-foreground focus:outline-none"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div className="relative border border-neutral-800 border-l-0">
                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  <select className="w-full pl-4 pr-10 py-4 bg-neutral-900 text-foreground focus:outline-none appearance-none">
                    <option value="">Personas</option>
                    <option value="1" className="bg-neutral-900 text-foreground">1 persona</option>
                    <option value="2" className="bg-neutral-900 text-foreground">2 personas</option>
                    <option value="3" className="bg-neutral-900 text-foreground">3 personas</option>
                    <option value="4" className="bg-neutral-900 text-foreground">4 personas</option>
                    <option value="5+" className="bg-neutral-900 text-foreground">5+ personas</option>
                  </select>
                </div>
                <button className="bg-foreground text-background px-8 py-4 font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 border border-neutral-800 border-l-0">
                  <Search className="w-4 h-4" />
                  Buscar
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Gestiona tus propiedades
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 p-8 border border-neutral-800">
              <div className="mb-4">
                <div className="w-12 h-12 bg-foreground flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Agregar Propiedades
                </h3>
                <p className="text-neutral-400">
                  Publica tus propiedades con descripciones detalladas, precios y amenidades.
                  Gestiona la disponibilidad de manera sencilla.
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 border border-neutral-800">
              <div className="mb-4">
                <div className="w-12 h-12 bg-foreground flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Gestionar Reservas
                </h3>
                <p className="text-neutral-400">
                  Administra las reservas de tus propiedades, controla fechas de entrada y salida,
                  y mantén un registro de todos los huéspedes.
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 border border-neutral-800">
              <div className="mb-4">
                <div className="w-12 h-12 bg-foreground flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Seguimiento
                </h3>
                <p className="text-neutral-400">
                  Monitorea tus ganancias, analiza el rendimiento de cada propiedad
                  y toma decisiones informadas para tu negocio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
            </div>
            <div className="text-neutral-400 text-sm">
              © 2025 RE/SIO. Plataforma de gestión de propiedades.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
