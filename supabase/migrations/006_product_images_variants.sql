-- Migración 006: Soporte para múltiples imágenes y variantes de color en productos
-- Fecha: 2026-05-10
--
-- Para agregar imágenes adicionales o variantes de color a un producto en Supabase:
--   UPDATE products SET
--     images = ARRAY['url1', 'url2'],
--     color_variants = '[{"color": "Rojo", "hex": "#FF0000", "image_url": "url"}]'::jsonb,
--     features = ARRAY['Resistente al agua', 'Batería 12h']
--   WHERE id = <product_id>;

-- Campo para imágenes adicionales (array de URLs)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Campo para variantes de color
-- Cada variante: { "color": string, "hex": string, "image_url": string }
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]';

-- Campo para características del producto (lista de strings)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
