import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Welcome from '@/components/auth/welcome'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/registro')
  }

  return <Welcome user={user} />
}