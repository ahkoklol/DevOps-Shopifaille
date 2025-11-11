CREATE TABLE IF NOT EXISTS webhook_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES webhook_subscription(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL,
  status text NOT NULL, -- PENDING | SENT | FAILED
  attempts int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliv_sub ON webhook_delivery(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliv_status ON webhook_delivery(status);
