-- ── Tabla de vistas de página ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL,
  referrer   TEXT,
  device     TEXT DEFAULT 'desktop',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pv_created ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pv_path    ON public.page_views(path);

-- RLS: cualquiera puede insertar (tracking anónimo), solo admins pueden leer
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_insert_public"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "page_views_select_admin"
  ON public.page_views FOR SELECT
  USING (is_admin());
