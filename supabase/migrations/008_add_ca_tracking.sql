-- Tracking de Correo Argentino en órdenes
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS ca_tracking_code TEXT,
  ADD COLUMN IF NOT EXISTS ca_shipment_at   TIMESTAMPTZ;

COMMENT ON COLUMN orders.ca_tracking_code IS 'Código de seguimiento asignado por Correo Argentino al crear el envío';
COMMENT ON COLUMN orders.ca_shipment_at   IS 'Fecha/hora en que se registró el envío en CA';
