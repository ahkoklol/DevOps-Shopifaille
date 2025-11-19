export type UUID = string;

export type OrderStatus = "CREATED" | "PAID" | "FULFILLED" | "CANCELLED";
export type TxStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "REFUNDED"
  | "FAILED";

export interface Order {
  id: UUID;
  customer_id: UUID;
  contact_email: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  currency: string;
  status: OrderStatus;
  shipping_address_json: unknown;
  billing_address_json?: unknown | null;
  created_at: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID;
  title_snapshot: string;
  sku_snapshot: string;
  attributes_snapshot_json: unknown;
  unit_price: number;
  qty: number;
  line_total: number;
}

export interface PaymentTransaction {
  id: UUID;
  order_id: UUID;
  provider: string;
  reference?: string | null;
  amount: number;
  status: TxStatus;
  created_at: string;
}

export interface OrderLifecycle {
  order_id: UUID;
  current_status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusEvent {
  id: UUID;
  order_id: UUID;
  from_status?: OrderStatus | null;
  to_status: OrderStatus;
  reason?: string | null;
  occurred_at: string;
  metadata_json: unknown;
}

export interface CreateOrderDto {
  customer_id: UUID;
  contact_email: string;
  currency: string;
  shipping_address_json: unknown;
  billing_address_json?: unknown | null;
  items: Array<{
    product_id: UUID;
    variant_id: UUID;
    qty: number;
    unit_price: number;
    title: string;
    sku: string;
    attrs?: unknown;
  }>;
  discounts?: number;
  tax?: number;
  shipping?: number;
}
