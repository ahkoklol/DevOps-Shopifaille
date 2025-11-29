CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "order" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  contact_email text NOT NULL,
  subtotal numeric NOT NULL,
  discount_total numeric NOT NULL DEFAULT 0,
  tax_total numeric NOT NULL DEFAULT 0,
  shipping_total numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL, -- CREATED | PAID | FULFILLED | CANCELLED
  shipping_address_json jsonb NOT NULL,
  billing_address_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  variant_id uuid NOT NULL,
  title_snapshot text NOT NULL,
  sku_snapshot text NOT NULL,
  attributes_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit_price numeric NOT NULL,
  qty int NOT NULL CHECK (qty > 0),
  line_total numeric NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_item_order ON order_item(order_id);

CREATE TABLE IF NOT EXISTS order_lifecycle (
  order_id uuid PRIMARY KEY REFERENCES "order"(id) ON DELETE CASCADE,
  current_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_order_status_event_order ON order_status_event(order_id);
