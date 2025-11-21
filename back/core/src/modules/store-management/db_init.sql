CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MERCHANT_STORE
CREATE TABLE IF NOT EXISTS merchant_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  plan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- STORE_BRANDING
CREATE TABLE IF NOT EXISTS store_branding (
  store_id UUID PRIMARY KEY REFERENCES merchant_store(id) ON DELETE CASCADE,
  theme_preset TEXT,
  logo_url TEXT,
  colors_json JSONB
);

-- STORE_SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
  store_id UUID PRIMARY KEY REFERENCES merchant_store(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  checkout_rules_json JSONB
);
