-- ============================================================
-- 001_create_tables.sql
-- Crea todas las tablas del e-commerce ZetaPets
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensiones ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tabla: profiles ──────────────────────────────────────────
-- Un perfil por usuario; se crea automáticamente al registrarse.
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  phone        TEXT,
  address      TEXT,
  city         TEXT,
  postal_code  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- ── Tabla: admin_users ───────────────────────────────────────
-- Lista de usuarios con rol de administrador.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: products ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  emoji       TEXT,
  category    TEXT NOT NULL,
  badge       TEXT,
  variants    TEXT[],           -- ej: ARRAY['Rojo','Azul']
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number         TEXT NOT NULL UNIQUE,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal             NUMERIC(12,2) NOT NULL,
  tax                  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total                NUMERIC(12,2) NOT NULL,
  payment_method       TEXT,
  shipping_name        TEXT,
  shipping_address     TEXT,
  shipping_phone       TEXT,
  shipping_postal_code TEXT,
  shipping_email       TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: order_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,   -- snapshot del nombre al comprar
  product_emoji TEXT,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(12,2) NOT NULL,
  total_price   NUMERIC(12,2) NOT NULL,
  variant       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_user_id  ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active   ON public.products(is_active);
