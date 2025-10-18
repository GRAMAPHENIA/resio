# RESIO

Una aplicación web para explorar y gestionar opciones de alojamiento, construida con Next.js, React y Supabase.

## Descripción

RESIO es una plataforma que permite a los usuarios explorar una amplia variedad de opciones de alojamiento que se adapten a sus necesidades. Actualmente incluye autenticación con Google a través de Supabase.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd resio
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env.local` con las siguientes variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. Ejecuta la aplicación en modo desarrollo:
   ```bash
   pnpm dev
   ```

## Uso

- Abre tu navegador en `http://localhost:3000`
- Haz clic en "Iniciar sesión con Google" para autenticarte
- Explora las opciones de alojamiento disponibles

## Tecnologías

- **Next.js**: Framework de React para aplicaciones web
- **React**: Biblioteca para interfaces de usuario
- **Supabase**: Plataforma de backend como servicio
- **Tailwind CSS**: Framework de CSS utilitario
- **TypeScript**: Superset de JavaScript con tipado estático

## Estructura del Proyecto

```
src/
├── app/
│   ├── auth/callback/route.ts  # Ruta de callback para autenticación
│   ├── page.tsx                # Página principal
│   └── layout.tsx              # Layout de la aplicación
├── components/
│   └── LoginButton.tsx         # Componente de botón de login
└── lib/supabase/
    ├── client.ts               # Cliente de Supabase para el cliente
    └── server.ts               # Cliente de Supabase para el servidor
```

## Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y haz commit: `git commit -m "Agrega nueva funcionalidad"`
3. Sube tus cambios: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
