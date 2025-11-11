CREATE TABLE IF NOT EXISTS store_settings (
  store_id uuid PRIMARY KEY REFERENCES merchant_store(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  checkout_rules_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
