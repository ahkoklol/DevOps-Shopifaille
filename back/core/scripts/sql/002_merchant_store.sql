CREATE TABLE IF NOT EXISTS store_branding (
  store_id uuid PRIMARY KEY REFERENCES merchant_store(id) ON DELETE CASCADE,
  theme_preset text NOT NULL DEFAULT 'default',
  logo_url text,
  colors_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
