// Helper para debug de variables de entorno
export function debugEnvironment() {
  if (typeof window !== 'undefined') {
    console.log('🔍 Debug Environment Variables:')
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Current URL:', window.location.origin)
    console.log('Environment:', process.env.NODE_ENV)
  }
}