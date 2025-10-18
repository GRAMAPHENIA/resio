'use client'

import supabase from "@/lib/supabase/client"

/**
 * Componente LoginButton
 *
 * Proporciona un botón para iniciar sesión con Google utilizando Supabase Auth.
 * Al hacer clic, redirige al usuario al flujo de autenticación de Google OAuth
 * y luego lo redirige de vuelta a la aplicación a través de /auth/callback.
 *
 * @returns {JSX.Element} Un botón estilizado con Tailwind CSS
 */
export default function LoginButton() {
  /**
   * Maneja el proceso de inicio de sesión con Google OAuth.
   * Utiliza Supabase para gestionar la autenticación.
   */
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
