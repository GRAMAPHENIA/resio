import { createClient } from '@/lib/supabase/client'

export class AuthService {
  private supabase = createClient()

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async signUpWithEmail(email: string, password: string, fullName: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clienteresio.vercel.app'

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${baseUrl}/auth/callback`
      }
    })

    if (error) {
      // Si el usuario ya existe, lanzar un error específico
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new Error('USER_ALREADY_EXISTS')
      }
      throw new Error(error.message)
    }

    return data
  }

  async signInWithGoogle(redirectTo: string = '/') {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clienteresio.vercel.app'

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=${redirectTo}`
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) {
      throw new Error(error.message)
    }
    return user
  }

  // Verificar si un usuario ya existe antes de permitir login con Google
  async checkUserExists() {
    // Esta función requeriría una función de base de datos personalizada
    // Por ahora, Google OAuth creará automáticamente el usuario si no existe
    return true
  }
}