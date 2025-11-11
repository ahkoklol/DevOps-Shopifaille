CREATE TABLE IF NOT EXISTS "order" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  contact_email text NOT NULL,
  subtotal numeric NOT NULL,
  discount_total numeric NOT NULL DEFAULT 0,
  tax_total numeric NOT NULL DEFAULT 0,
  shipping_total numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL, -- CREATED | PAID | FULFILLED | CANCELLED
  shipping_address_json jsonb NOT NULL,
  billing_address_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
