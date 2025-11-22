CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS merchant_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id uuid NOT NULL,
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  custom_domain text UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_branding (
  store_id uuid PRIMARY KEY REFERENCES merchant_store(id) ON DELETE CASCADE,
  theme_preset text NOT NULL DEFAULT 'default',
  logo_url text,
  colors_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS store_settings (
  store_id uuid PRIMARY KEY REFERENCES merchant_store(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  checkout_rules_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS store_category (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES merchant_store(id) ON DELETE CASCADE,
  parent_category_id uuid REFERENCES store_category(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (store_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_store_category_parent ON store_category(parent_category_id);
