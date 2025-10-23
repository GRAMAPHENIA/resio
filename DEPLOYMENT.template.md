# Configuración de Deployment

## Variables de Entorno en Vercel

Para que la aplicación funcione correctamente en producción, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### Variables Requeridas

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Valor: Tu URL de Supabase (formato: `https://[project-id].supabase.co`)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Valor: Tu clave anónima de Supabase (comienza con `eyJ...`)

3. **NEXT_PUBLIC_SITE_URL**
   - Valor: La URL de tu sitio en producción (ej: `https://tu-sitio.vercel.app`)

4. **MP_ACCESS_TOKEN**
   - Valor: Tu token de acceso de Mercado Pago (TEST o PROD)

5. **NEXT_PUBLIC_MP_PUBLIC_KEY**
   - Valor: Tu clave pública de Mercado Pago (TEST o PROD)

## Cómo configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a Settings > Environment Variables
3. Agrega cada variable con su respectivo valor
4. Asegúrate de que estén configuradas para el environment "Production"
5. Redeploy tu aplicación

## Cambios Realizados

- ✅ Eliminadas URLs hardcodeadas en `auth.service.ts`
- ✅ Eliminadas URLs hardcodeadas en `auth/callback/route.ts`
- ✅ Cambiado `window.location.href` por `router.push()` en componentes de auth
- ✅ Creados archivos `.env.development` y `.env.production`
- ✅ Actualizado `.env.local` para ser más claro

## Verificación

Después de configurar las variables de entorno en Vercel y hacer redeploy:

1. El login con email debería redirigir correctamente a la home
2. El login con Google debería redirigir correctamente a la home
3. El registro debería redirigir correctamente a la página de bienvenida
4. No deberían aparecer más referencias a localhost en producción

## Nota de Seguridad

- Nunca commitees archivos con información sensible como tokens, URLs específicas o claves
- Usa siempre variables de entorno para información sensible
- El archivo `DEPLOYMENT.md` con valores reales debe estar en `.gitignore`