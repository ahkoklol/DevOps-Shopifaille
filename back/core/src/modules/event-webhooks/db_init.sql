CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS webhook_subscription (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES merchant_store(id) ON DELETE CASCADE,
  target_url text NOT NULL,
  secret text NOT NULL,
  event_types_csv text NOT NULL, -- ex: "order.created,order.paid"
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_sub_store ON webhook_subscription(store_id);

CREATE TABLE IF NOT EXISTS webhook_delivery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id uuid NOT NULL REFERENCES webhook_subscription(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL,
  status text NOT NULL, -- PENDING | SENT | FAILED
  attempts int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliv_sub ON webhook_delivery(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliv_status ON webhook_delivery(status);
