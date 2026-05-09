-- ============================================================
-- 003_rls_policies.sql
-- Activa RLS y crea todas las políticas de Row Level Security
-- ============================================================

-- ── Activar RLS en todas las tablas ──────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ── Helper: verifica si el usuario es admin ───────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;


-- ════════════════════════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "profiles: usuario lee su perfil"    ON public.profiles;
DROP POLICY IF EXISTS "profiles: usuario crea su perfil"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: usuario edita su perfil"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin lee todos"          ON public.profiles;

-- Usuario solo ve su propio perfil
CREATE POLICY "profiles: usuario lee su perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Usuario solo puede crear su propio perfil
CREATE POLICY "profiles: usuario crea su perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuario solo puede editar su propio perfil
CREATE POLICY "profiles: usuario edita su perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin puede ver todos los perfiles
CREATE POLICY "profiles: admin lee todos"
  ON public.profiles FOR SELECT
  USING (public.is_admin());


-- ════════════════════════════════════════════════════════════
-- PRODUCTS
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "products: todos leen activos"  ON public.products;
DROP POLICY IF EXISTS "products: admin crea"          ON public.products;
DROP POLICY IF EXISTS "products: admin edita"         ON public.products;
DROP POLICY IF EXISTS "products: admin elimina"       ON public.products;

-- Cualquiera puede leer productos activos (incluso sin login)
CREATE POLICY "products: todos leen activos"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

-- Solo admins pueden crear productos
CREATE POLICY "products: admin crea"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

-- Solo admins pueden editar productos
CREATE POLICY "products: admin edita"
  ON public.products FOR UPDATE
  USING (public.is_admin());

-- Solo admins pueden eliminar productos
CREATE POLICY "products: admin elimina"
  ON public.products FOR DELETE
  USING (public.is_admin());


-- ════════════════════════════════════════════════════════════
-- ORDERS
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "orders: usuario ve sus órdenes"    ON public.orders;
DROP POLICY IF EXISTS "orders: usuario crea orden"        ON public.orders;
DROP POLICY IF EXISTS "orders: admin ve todas"            ON public.orders;
DROP POLICY IF EXISTS "orders: admin cambia estado"       ON public.orders;

-- Usuario autenticado solo ve sus propias órdenes
CREATE POLICY "orders: usuario ve sus órdenes"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Usuario autenticado puede crear una orden propia
CREATE POLICY "orders: usuario crea orden"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admin puede ver todas las órdenes
CREATE POLICY "orders: admin ve todas"
  ON public.orders FOR SELECT
  USING (public.is_admin());

-- Solo admin puede cambiar estado de una orden
CREATE POLICY "orders: admin cambia estado"
  ON public.orders FOR UPDATE
  USING (public.is_admin());


-- ════════════════════════════════════════════════════════════
-- ORDER_ITEMS
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "order_items: usuario ve sus items"  ON public.order_items;
DROP POLICY IF EXISTS "order_items: usuario crea items"    ON public.order_items;
DROP POLICY IF EXISTS "order_items: admin ve todos"        ON public.order_items;

-- Usuario ve los items de sus propias órdenes
CREATE POLICY "order_items: usuario ve sus items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Usuario crea items solo en órdenes propias
CREATE POLICY "order_items: usuario crea items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Admin ve todos los items
CREATE POLICY "order_items: admin ve todos"
  ON public.order_items FOR SELECT
  USING (public.is_admin());


-- ════════════════════════════════════════════════════════════
-- ADMIN_USERS
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "admin_users: admin lee tabla" ON public.admin_users;

-- Solo admins pueden ver la tabla de admins
CREATE POLICY "admin_users: admin lee tabla"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());
