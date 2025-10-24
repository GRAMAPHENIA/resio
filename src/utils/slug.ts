import { SupabaseClient } from '@supabase/supabase-js'

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-|-$/g, '') // Remover guiones al inicio y final
}

export async function generateUniqueSlug(
  text: string, 
  supabase: SupabaseClient, 
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(text)
  let slug = baseSlug
  let counter = 1

  while (true) {
    // Verificar si el slug ya existe
    let query = supabase
      .from('properties')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { error } = await query.single()

    // Si no existe o hay error (no encontrado), el slug está disponible
    if (error && error.code === 'PGRST116') {
      return slug
    }

    // Si existe, agregar número al final
    counter++
    slug = `${baseSlug}-${counter}`
  }
}

export function getPropertyUrl(property: Property): string {
  if (property.slug) {
    return `/alojamiento/${property.slug}`
  }
  // Fallback al ID si no hay slug
  return `/alojamiento/${property.id}`
}

interface Property {
  id: string
  slug?: string
}