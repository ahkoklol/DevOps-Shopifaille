CREATE TABLE IF NOT EXISTS webhook_subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES merchant_store(id) ON DELETE CASCADE,
  target_url text NOT NULL,
  secret text NOT NULL,
  event_types_csv text NOT NULL, -- ex: "order.created,order.paid"
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_sub_store ON webhook_subscription(store_id);
