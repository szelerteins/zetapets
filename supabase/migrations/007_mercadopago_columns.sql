-- Columnas para integración MercadoPago + retiro en local
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status         TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS shipping_cost          NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_city          TEXT,
  ADD COLUMN IF NOT EXISTS shipping_email         TEXT,
  ADD COLUMN IF NOT EXISTS delivery_method        TEXT DEFAULT 'shipping';

CREATE INDEX IF NOT EXISTS idx_orders_mp_payment_id
  ON orders (mercadopago_payment_id);

COMMENT ON COLUMN orders.payment_status IS 'pending | paid | failed';
COMMENT ON COLUMN orders.delivery_method IS 'shipping | pickup';
