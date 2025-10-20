
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/ui/logo";
import Link from "next/link";
import { Plus, Calendar, BarChart3 } from "lucide-react";

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
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Gestiona tus propiedades
              <br />
              de manera simple
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto mb-8">
              RE/SIO es la plataforma que necesitas para administrar tus propiedades en alquiler.
              Publica, gestiona reservas y controla tus ingresos desde un solo lugar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              className="bg-foreground text-background px-8 py-3 text-lg font-medium hover:bg-neutral-200 transition-colors"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/ingresar"
              className="border border-neutral-800 text-foreground px-8 py-3 text-lg font-medium hover:bg-neutral-900 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Todo lo que necesitas para gestionar tus propiedades
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Una plataforma completa y minimalista diseñada para propietarios que buscan eficiencia
            </p>
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

      {/* CTA Section */}
      <section className="py-20 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ¿Listo para simplificar la gestión de tus propiedades?
          </h2>
          <p className="text-neutral-400 mb-8 text-lg">
            Únete a RE/SIO y comienza a gestionar tus alquileres de manera profesional
          </p>
          <Link
            href="/registro"
            className="bg-foreground text-background px-8 py-3 text-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Crear Cuenta Gratis
          </Link>
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
