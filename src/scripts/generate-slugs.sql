-- Script para generar slugs para propiedades existentes
-- Ejecutar este script en Supabase SQL Editor después de agregar la columna slug

-- Primero, agregar la columna slug si no existe
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Función para generar slug en PostgreSQL
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
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

-- Actualizar todas las propiedades existentes con slugs
UPDATE properties 
SET slug = generate_slug(name) 
WHERE slug IS NULL;

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Limpiar función temporal
DROP FUNCTION generate_slug(TEXT);