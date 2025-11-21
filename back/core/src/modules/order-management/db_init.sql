CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ORDER
CREATE TABLE IF NOT EXISTS "order" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID,
  contact_email TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount_total NUMERIC DEFAULT 0,
  tax_total NUMERIC DEFAULT 0,
  shipping_total NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  shipping_address_json JSONB,
  billing_address_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ORDER_ITEM
CREATE TABLE IF NOT EXISTS order_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES "order"(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  title_snapshot TEXT NOT NULL,
  sku_snapshot TEXT NOT NULL,
  attributes_snapshot_json JSONB,
  unit_price NUMERIC NOT NULL,
  qty INT NOT NULL,
  line_total NUMERIC NOT NULL
);

-- PAYMENT_TRANSACTION
CREATE TABLE IF NOT EXISTS payment_transaction (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES "order"(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  reference TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ORDER_LIFECYCLE
CREATE TABLE IF NOT EXISTS order_lifecycle (
  order_id UUID PRIMARY KEY REFERENCES "order"(id) ON DELETE CASCADE,
  current_status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ORDER_STATUS_EVENT
CREATE TABLE IF NOT EXISTS order_status_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES "order"(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  occurred_at TIMESTAMP DEFAULT NOW(),
  metadata_json JSONB
);
