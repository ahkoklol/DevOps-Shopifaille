export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "FAILED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number; // final unit price at checkout
}

export interface OrderTimelineEvent {
  at: string;
  type:
    | "CREATED"
    | "STATUS_CHANGED"
    | "PAID"
    | "REFUND_PARTIAL"
    | "REFUND_TOTAL"
    | "FAILED";
  payload?: Record<string, unknown>;
}

export interface Order {
  id: string;
  storeId: string;
  customerId?: string | null;
  status: OrderStatus;
  totalAmount: number;
  taxAmount: number;
  shippingCost: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
  transactionId?: string | null;
}

export interface PlaceOrderItemDTO {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderDTO {
  idempotencyKey?: string;
  storeId: string;
  customerId?: string | null;
  currency: string;
  items: PlaceOrderItemDTO[];
  totals: {
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    total: number;
  };
}

export interface UpdateStatusDTO {
  status: OrderStatus;
}
