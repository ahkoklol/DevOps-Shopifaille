CREATE TABLE IF NOT EXISTS order_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
