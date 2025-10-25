# Configuración de Base de Datos para RESIO

Este documento explica cómo configurar la base de datos en Supabase para que el calendario de reservas funcione correctamente.

## Pasos para configurar la base de datos

### 1. Configuración inicial (si no está hecha)

Si aún no has ejecutado el script inicial, ejecuta primero `setup-database.sql` en el SQL Editor de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `setup-database.sql`
4. Ejecuta el script

### 2. Actualizaciones para el calendario

Para mejorar el rendimiento y agregar funcionalidades del calendario, ejecuta `database-updates.sql`:

1. En el SQL Editor de Supabase
2. Copia y pega el contenido de `database-updates.sql`
3. Ejecuta el script

## Estructura de tablas

### Tabla `properties`
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- location (VARCHAR)
- price_per_night (DECIMAL)
- images (TEXT[]) -- Array de URLs de imágenes
- owner_id (UUID, Foreign Key)
- available (BOOLEAN)
- bedrooms (INTEGER)
- bathrooms (INTEGER)
- area (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabla `bookings`
```sql
- id (UUID, Primary Key)
- property_id (UUID, Foreign Key)
- user_name (VARCHAR)
- user_email (VARCHAR)
- user_phone (VARCHAR, opcional)
- start_date (DATE)
- end_date (DATE)
- status (VARCHAR: 'pending', 'paid', 'cancelled')
- payment_id (VARCHAR, opcional)
- amount (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Funciones útiles agregadas

### `check_property_availability(property_id, start_date, end_date)`
Verifica si una propiedad está disponible en un rango de fechas.

```sql
SELECT check_property_availability(
  'property-uuid-here',
  '2024-12-01',
  '2024-12-05'
);
```

### `get_monthly_bookings(year, month, property_id)`
Obtiene todas las reservas confirmadas de un mes específico.

```sql
-- Reservas de diciembre 2024
SELECT * FROM get_monthly_bookings(2024, 12);

-- Reservas de una propiedad específica en diciembre 2024
SELECT * FROM get_monthly_bookings(2024, 12, 'property-uuid-here');
```

## Vista `booking_stats`
Proporciona estadísticas agregadas por propiedad:

```sql
SELECT * FROM booking_stats;
```

## Índices para rendimiento

Los siguientes índices se crean automáticamente para mejorar el rendimiento:

- `idx_bookings_dates`: Para consultas por fechas
- `idx_bookings_property_id`: Para consultas por propiedad
- `idx_bookings_status`: Para filtrar por estado
- `idx_bookings_property_dates_status`: Índice compuesto para el calendario

## Políticas de seguridad (RLS)

### Properties
- **Lectura pública**: Cualquiera puede ver las propiedades disponibles

### Bookings
- **Lectura pública**: Cualquiera puede ver las reservas (para mostrar disponibilidad)
- **Inserción controlada**: Solo se permiten reservas sin superposición de fechas

## Datos de ejemplo

Para probar el sistema, puedes insertar algunas propiedades de ejemplo:

```sql
-- Primero necesitas un usuario registrado en auth.users
-- Reemplaza 'your-user-uuid' con un UUID real

INSERT INTO properties (name, description, location, price_per_night, images, owner_id, bedrooms, bathrooms, area) VALUES
('Cabaña del Lago', 'Hermosa cabaña con vista al lago', 'Villa La Angostura', 15000.00, 
 ARRAY['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800'], 
 'your-user-uuid', 2, 1, 80),

('Casa de Montaña', 'Casa amplia con chimenea y jardín', 'Bariloche', 22000.00,
 ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
 'your-user-uuid', 3, 2, 120);

-- Insertar algunas reservas de ejemplo
INSERT INTO bookings (property_id, user_name, user_email, start_date, end_date, status, amount) VALUES
((SELECT id FROM properties LIMIT 1), 'Juan Pérez', 'juan@email.com', '2024-12-15', '2024-12-20', 'paid', 75000),
((SELECT id FROM properties LIMIT 1), 'María García', 'maria@email.com', '2024-12-25', '2024-12-30', 'paid', 75000);
```

## Verificación

Para verificar que todo está configurado correctamente:

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Verificar funciones
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Verificar datos
SELECT COUNT(*) as total_properties FROM properties;
SELECT COUNT(*) as total_bookings FROM bookings;
```

## Troubleshooting

### Error: "relation does not exist"
- Asegúrate de haber ejecutado ambos scripts SQL
- Verifica que estés en el proyecto correcto de Supabase

### Error: "permission denied"
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que tu usuario tenga los permisos necesarios

### El calendario no muestra reservas
- Verifica que existan reservas con status 'paid'
- Revisa que las fechas estén en el formato correcto (YYYY-MM-DD)
- Comprueba que property_id coincida entre properties y bookings

## Próximos pasos

Una vez configurada la base de datos:

1. El calendario mostrará automáticamente las reservas existentes
2. Podrás filtrar por propiedad específica
3. Las estadísticas se calcularán en tiempo real
4. Las funciones de disponibilidad estarán listas para usar en el frontend