CREATE TABLE IF NOT EXISTS order_lifecycle (
  order_id uuid PRIMARY KEY REFERENCES "order"(id) ON DELETE CASCADE,
  current_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
