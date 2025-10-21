
'use client'

import { useState, useEffect } from 'react'
import Logo from "@/components/ui/logo";
import Link from "next/link";
import { Plus, Calendar, BarChart3, Search, MapPin, Users } from "lucide-react";
import SearchBar from '@/components/ui/search-bar'
import PropertyCard from '@/components/ui/property-card'
import BookingForm from '@/components/ui/booking-form'
import PaymentModal from '@/components/ui/payment-modal'
import { Property, Booking } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [searchResults, setSearchResults] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [publishedProperties, setPublishedProperties] = useState<Property[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchPublishedProperties = async () => {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6) // Mostrar las últimas 6 propiedades publicadas

      if (!error && properties) {
        setPublishedProperties(properties)
      }
    }

    fetchPublishedProperties()
  }, [supabase])

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
            <div className="max-w-4xl mx-auto mb-8">
              <SearchBar onResults={setSearchResults} />
            </div>
          </div>

        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="py-20 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Resultados de búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onBook={setSelectedProperty}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Published Properties Section */}
      {publishedProperties.length > 0 && (
        <section className="py-20 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Propiedades Disponibles
              </h2>
              <p className="text-neutral-400">
                Descubre las mejores opciones de alquiler en nuestro catálogo
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onBook={setSelectedProperty}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Modals */}
      {selectedProperty && (
        <BookingForm
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onSuccess={(id) => {
            setPreferenceId(id)
            setSelectedProperty(null)
          }}
        />
      )}

      {preferenceId && (
        <PaymentModal
          preferenceId={preferenceId}
          onClose={() => setPreferenceId(null)}
        />
      )}
    </div>
  );
}
