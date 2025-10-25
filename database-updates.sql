-- Actualizaciones para mejorar la estructura de la base de datos de RESIO
-- Ejecutar en el SQL Editor de Supabase

-- ===========================================
-- ACTUALIZACIÓN 1: Modificar tabla properties para soportar múltiples imágenes
-- ===========================================

-- Agregar columna para múltiples imágenes (si no existe)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrar datos existentes de image_url a images (si existe la columna image_url)
UPDATE properties 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Opcional: Eliminar la columna image_url después de migrar los datos
-- ALTER TABLE properties DROP COLUMN IF EXISTS image_url;

-- ===========================================
-- ACTUALIZACIÓN 2: Agregar índices para mejorar rendimiento
-- ===========================================

-- Índice para búsquedas por fechas en bookings
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (start_date, end_date);

-- Índice para búsquedas por property_id en bookings
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings (property_id);

-- Índice para búsquedas por status en bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- Índice compuesto para consultas de calendario
CREATE INDEX IF NOT EXISTS idx_bookings_property_dates_status ON bookings (property_id, start_date, end_date, status);

-- ===========================================
-- ACTUALIZACIÓN 3: Función para verificar disponibilidad
-- ===========================================

CREATE OR REPLACE FUNCTION check_property_availability(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE property_id = p_property_id
      AND status IN ('paid', 'pending')
      AND (p_start_date, p_end_date) OVERLAPS (start_date, end_date)
  );
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ACTUALIZACIÓN 4: Vista para estadísticas de reservas
-- ===========================================

CREATE OR REPLACE VIEW booking_stats AS
SELECT 
  p.id as property_id,
  p.name as property_name,
  p.location,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings,
  COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.amount END), 0) as total_revenue,
  COALESCE(AVG(CASE WHEN b.status = 'paid' THEN b.amount END), 0) as avg_booking_value
FROM properties p
LEFT JOIN bookings b ON p.id = b.property_id
GROUP BY p.id, p.name, p.location;

-- ===========================================
-- ACTUALIZACIÓN 5: Función para obtener reservas del mes
-- ===========================================

CREATE OR REPLACE FUNCTION get_monthly_bookings(
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  p_property_id UUID DEFAULT NULL
) RETURNS TABLE (
  booking_id UUID,
  property_id UUID,
  property_name VARCHAR,
  user_name VARCHAR,
  user_email VARCHAR,
  start_date DATE,
  end_date DATE,
  status VARCHAR,
  amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.property_id,
    p.name,
    b.user_name,
    b.user_email,
    b.start_date,
    b.end_date,
    b.status,
    b.amount
  FROM bookings b
  JOIN properties p ON b.property_id = p.id
  WHERE 
    (EXTRACT(YEAR FROM b.start_date) = p_year OR EXTRACT(YEAR FROM b.end_date) = p_year)
    AND (EXTRACT(MONTH FROM b.start_date) = p_month OR EXTRACT(MONTH FROM b.end_date) = p_month)
    AND (p_property_id IS NULL OR b.property_id = p_property_id)
    AND b.status = 'paid'
  ORDER BY b.start_date;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- ACTUALIZACIÓN 6: Trigger para actualizar timestamps
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Agregar columna updated_at si no existe
ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VERIFICACIÓN
-- ===========================================

-- Verificar la estructura actualizada
\d properties;
\d bookings;

-- Verificar índices
SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('properties', 'bookings');

-- Verificar funciones
SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_schema = 'public';