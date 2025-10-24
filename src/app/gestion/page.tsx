import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GestionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/ingresar')
  }

  // Redirigir al panel de propiedades
  redirect('/propiedades')
}