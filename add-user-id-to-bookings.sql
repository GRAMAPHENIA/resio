-- Agregar columna user_id a la tabla bookings para asociar reservas con usuarios autenticados
ALTER TABLE bookings 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento de las consultas por user_id
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- Actualizar la política de lectura de reservas para permitir que los usuarios vean sus propias reservas
DROP POLICY IF EXISTS "Lectura pública de reservas" ON bookings;

-- Nueva política: lectura pública para administradores, usuarios pueden ver sus propias reservas
CREATE POLICY "Usuarios pueden ver sus propias reservas" ON bookings
  FOR SELECT USING (
    -- Lectura pública (para búsqueda por email/código)
    true
    -- O si es el propietario de la reserva
    OR auth.uid() = user_id
  );

-- Política para que usuarios autenticados puedan crear reservas
CREATE POLICY "Usuarios autenticados pueden crear reservas" ON bookings
  FOR INSERT WITH CHECK (
    -- Verificar que no hay superposición de fechas
    NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.property_id = bookings.property_id
        AND b.status != 'cancelled'
        AND (bookings.start_date, bookings.end_date) OVERLAPS (b.start_date, b.end_date)
    )
  );

-- Política para actualizar reservas (solo el propietario o admin)
CREATE POLICY "Usuarios pueden actualizar sus propias reservas" ON bookings
  FOR UPDATE USING (
    auth.uid() = user_id
    -- Los administradores pueden actualizar cualquier reserva
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

COMMENT ON COLUMN bookings.user_id IS 'ID del usuario autenticado que hizo la reserva (opcional para reservas de invitados)';