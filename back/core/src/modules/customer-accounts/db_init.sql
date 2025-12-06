CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  password_hash text,
);

-- Table pour stocker les refresh tokens (hashés)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_customer ON refresh_tokens(customer_id);

CREATE TABLE IF NOT EXISTS customer_address (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customer(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('billing', 'shipping')),
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  region TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customer_order_ref (
  customer_id UUID REFERENCES customer(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  placed_at TIMESTAMP DEFAULT NOW(),
  status TEXT,
  grand_total NUMERIC,
  PRIMARY KEY (customer_id, order_id)
);