-- Expand page_views with enhanced tracking columns
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS session_id     TEXT,
  ADD COLUMN IF NOT EXISTS visitor_id     TEXT,
  ADD COLUMN IF NOT EXISTS is_new_visitor BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS time_on_page   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scroll_depth   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS utm_source     TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium     TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign   TEXT;

CREATE INDEX IF NOT EXISTS idx_pv_session ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_pv_visitor ON public.page_views(visitor_id);

-- Click events table for heatmap
CREATE TABLE IF NOT EXISTS public.click_events (
  id         BIGSERIAL PRIMARY KEY,
  session_id TEXT,
  path       TEXT NOT NULL,
  x_pct      NUMERIC(5,2),
  y_pct      NUMERIC(5,2),
  element    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ce_path    ON public.click_events(path);
CREATE INDEX IF NOT EXISTS idx_ce_created ON public.click_events(created_at DESC);

ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "click_events_insert" ON public.click_events FOR INSERT WITH CHECK (true);
CREATE POLICY "click_events_admin"  ON public.click_events FOR SELECT USING (is_admin());
