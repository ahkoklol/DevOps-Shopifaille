export type OrderEventName =
  | "order.created"
  | "order.status.updated"
  | "order.failed"
  | "order.paid"
  | "order.refunded";

export interface OrderEvent<T = unknown> {
  event: OrderEventName;
  data: T;
  at: string; // ISO timestamp
}
