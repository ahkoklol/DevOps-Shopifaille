CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- WEBHOOK_SUBSCRIPTION
CREATE TABLE IF NOT EXISTS webhook_subscription (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL,
  target_url TEXT NOT NULL,
  secret TEXT NOT NULL,
  event_types_csv TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WEBHOOK_DELIVERY
CREATE TABLE IF NOT EXISTS webhook_delivery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES webhook_subscription(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload_json JSONB,
  status TEXT NOT NULL,
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP
);
