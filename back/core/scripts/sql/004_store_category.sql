CREATE TABLE IF NOT EXISTS store_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES merchant_store(id) ON DELETE CASCADE,
  parent_category_id uuid REFERENCES store_category(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (store_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_store_category_parent ON store_category(parent_category_id);
