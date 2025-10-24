# Configuración de Supabase para Producción

## ⚠️ URGENTE: Configurar URLs en Supabase Dashboard

El problema de redirección a localhost se debe a la configuración en Supabase. Sigue estos pasos:

### 1. Ve a Supabase Dashboard

- Proyecto: `fwosquhbfdyzylmyyfpr`
- URL: <https://supabase.com/dashboard/project/fwosquhbfdyzylmyyfpr>

### 2. Configurar Authentication URLs

Ve a **Authentication** → **URL Configuration**

#### Site URL

```
https://clienteresio.vercel.app
```

#### Redirect URLs (agregar ambas)

```
https://clienteresio.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 3. Verificar OAuth Providers

Si usas Google OAuth, ve a **Authentication** → **Providers** → **Google**

Asegúrate que las **Authorized redirect URIs** en Google Console incluyan:

- `https://fwosquhbfdyzylmyyfpr.supabase.co/auth/v1/callback`

### 4. Después de cambiar la configuración

1. Guarda los cambios en Supabase
2. Espera 1-2 minutos para que se propaguen
3. Prueba el login nuevamente

### 5. Si el problema persiste

- Verifica que las variables de entorno en Vercel estén correctas
- Revisa los logs del callback en Vercel Functions
- Contacta si necesitas ayuda adicional

## Variables de Entorno Requeridas en Vercel

```
NEXT_PUBLIC_SITE_URL=https://clienteresio.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://fwosquhbfdyzylmyyfpr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4sQNwlPQHoRM3wipfWADYQ_6MjO5tij
```
