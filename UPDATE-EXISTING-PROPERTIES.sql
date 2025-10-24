-- Script para actualizar propiedades existentes con slugs
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna slug si no existe
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- 2. Función temporal para generar slugs
CREATE OR REPLACE FUNCTION temp_generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        trim(input_text),
                        '[áàäâã]', 'a', 'g'
                      ),
                      '[éèëê]', 'e', 'g'
                    ),
                    '[íìïî]', 'i', 'g'
                  ),
                  '[óòöôõ]', 'o', 'g'
                ),
                '[úùüû]', 'u', 'g'
              ),
              '[ñ]', 'n', 'g'
            ),
            '[ç]', 'c', 'g'
          ),
          '[^a-z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Actualizar propiedades existentes
UPDATE properties 
SET slug = temp_generate_slug(name) 
WHERE slug IS NULL;

-- 4. Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- 5. Limpiar función temporal
DROP FUNCTION temp_generate_slug(TEXT);

-- Verificar resultados
SELECT id, name, slug FROM properties ORDER BY created_at DESC;