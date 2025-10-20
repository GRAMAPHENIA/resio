# RE/SIO - Plataforma de Alquiler de Propiedades

Una aplicación minimalista para gestionar propiedades en alquiler, construida con Next.js 15, Supabase y Tailwind CSS.

## Características

- ✅ Autenticación completa con Google OAuth
- ✅ Gestión de propiedades (CRUD)
- ✅ Dashboard de usuario
- ✅ Diseño minimalista sin bordes redondeados
- ✅ Paleta de colores limitada (gris oscuro + blanco marfil)
- ✅ Responsive design

## Configuración

### 1. Configurar Supabase

1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. En el SQL Editor, ejecuta el contenido del archivo `supabase-schema.sql`
3. Ve a Authentication > Providers y configura Google OAuth:
   - Habilita Google provider
   - Agrega tu Client ID y Client Secret de Google
   - Configura la URL de redirección: `https://tu-proyecto.supabase.co/auth/v1/callback`

### 2. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Ve a Credentials y crea OAuth 2.0 Client IDs
5. Agrega las URLs autorizadas:
   - `http://localhost:3000` (desarrollo)
   - `https://tu-dominio.vercel.app` (producción)
6. Agrega las URLs de redirección:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`

### 3. Variables de Entorno

Actualiza tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Instalar Dependencias

```bash
pnpm install
```

### 5. Ejecutar en Desarrollo

```bash
pnpm dev
```

## Estructura del Proyecto

```
src/
├── app/                           # App Router de Next.js
│   ├── auth/callback/             # Callback de OAuth
│   ├── registro/                  # Página de registro
│   ├── ingresar/                  # Página de login
│   ├── bienvenida/                # Página de bienvenida
│   ├── tablero/                   # Tablero principal
│   ├── propiedades/               # Gestión de propiedades
│   │   ├── page.tsx               # Lista de propiedades
│   │   └── agregar/               # Agregar propiedad
│   ├── page.tsx                   # Página de inicio pública
│   └── layout.tsx                 # Layout principal
├── components/                    # Componentes reutilizables
│   ├── auth/                      # Componentes de autenticación
│   ├── layout/                    # Layout y navegación
│   ├── properties/                # Componentes de propiedades
│   └── ui/                        # Componentes de UI básicos
├── services/                      # Servicios de negocio
│   └── auth.service.ts            # Servicio de autenticación
├── hooks/                         # Hooks personalizados
│   └── useAuth.ts                 # Hook de autenticación
├── lib/                           # Utilidades y configuración
│   └── supabase/                  # Cliente de Supabase
├── utils/                         # Utilidades generales
│   └── validation.ts              # Validaciones
├── constants/                     # Constantes de la aplicación
│   └── routes.ts                  # Rutas de la aplicación
└── types/                         # Tipos de TypeScript
    └── database.ts                # Tipos de base de datos
```

## Funcionalidades Implementadas

### Autenticación
- Login con Google OAuth
- Middleware para proteger rutas
- Logout automático
- Gestión de sesiones

### Propiedades
- Agregar nuevas propiedades
- Listar propiedades del usuario
- Formulario completo con validación
- Cards de propiedades con información básica

### UI/UX
- Diseño minimalista
- Logo RE/SIO personalizado
- Navegación intuitiva
- Responsive design

## Próximos Pasos

- [ ] Subida de imágenes para propiedades
- [ ] Sistema de reservas
- [ ] Búsqueda y filtros
- [ ] Perfil de usuario
- [ ] Notificaciones
- [ ] Dashboard de analytics

## Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth + Google OAuth
- **Deployment**: Vercel

## Deploy

La aplicación está configurada para desplegarse automáticamente en Vercel. Solo conecta tu repositorio de GitHub y Vercel se encargará del resto.

Asegúrate de configurar las variables de entorno en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`