'use client'

import supabase from "@/lib/supabase/client"

export default function LoginButton() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error('Error al iniciar sesión:', error.message)
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
    >
      Iniciar sesión con Google
    </button>
  )
}
