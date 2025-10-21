-- Script para configurar la base de datos de RESIO en Supabase
-- Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- ===========================================
-- PASO 1: Crear tabla properties
-- ===========================================

CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT true,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  area INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PASO 2: Crear tabla bookings
-- ===========================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PASO 3: Habilitar RLS (Row Level Security)
-- ===========================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PASO 4: Políticas para properties (lectura pública)
-- ===========================================

CREATE POLICY "Lectura pública de propiedades" ON properties
  FOR SELECT USING (true);

-- ===========================================
-- PASO 5: Políticas para bookings (lectura pública, inserción con verificación)
-- ===========================================

CREATE POLICY "Lectura pública de reservas" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Inserción de reservas sin superposición de fechas" ON bookings
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.property_id = property_id
        AND b.status != 'cancelled'
        AND (start_date, end_date) OVERLAPS (b.start_date, b.end_date)
    )
  );

-- ===========================================
-- PASO 6: Insertar datos de ejemplo (opcional)
-- ===========================================

-- Nota: Para insertar propiedades de ejemplo, primero debes tener usuarios registrados
-- Los siguientes inserts requieren que reemplaces 'user-uuid-here' con un UUID de usuario real
-- INSERT INTO properties (name, description, location, price_per_night, image_url, owner_id, bedrooms, bathrooms, area) VALUES
-- ('Cabaña del Lago', 'Hermosa cabaña con vista al lago, perfecta para descansar', 'Villa La Angostura, Neuquén', 15000.00, 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800', 'user-uuid-here', 2, 1, 80);

-- INSERT INTO properties (name, description, location, price_per_night, image_url, owner_id, bedrooms, bathrooms, area) VALUES
-- ('Casa de Montaña', 'Casa amplia con chimenea y jardín, ideal para familias', 'Bariloche, Río Negro', 22000.00, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'user-uuid-here', 3, 2, 120);

-- INSERT INTO properties (name, description, location, price_per_night, image_url, owner_id, bedrooms, bathrooms, area) VALUES
-- ('Apartamento Centro', 'Moderno apartamento en el centro de la ciudad', 'Buenos Aires, CABA', 12000.00, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'user-uuid-here', 1, 1, 45);

-- ===========================================
-- VERIFICACIÓN
-- ===========================================

-- Verificar que las tablas se crearon correctamente
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE schemaname = 'public';