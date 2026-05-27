-- ============================================================
-- 011_discount_codes.sql
-- Agrega código de descuento de cumpleaños con vencimiento al perfil
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discount_code      TEXT,
  ADD COLUMN IF NOT EXISTS discount_expires_at TIMESTAMPTZ;

-- Índice único para buscar por código eficientemente
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_discount_code
  ON public.profiles(discount_code)
  WHERE discount_code IS NOT NULL;
