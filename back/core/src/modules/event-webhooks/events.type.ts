export type Topic =
  | "order.created"
  | "order.status.updated"
  | "order.paid"
  | "order.refunded"
  | "store.created"
  | "theme.published"
  | "settings.checkout.updated";

export interface IngestEvent<T = unknown> {
  id: string;            // unique event id
  type: `${Topic}@v${number}`;
  storeId: string;
  createdAt: string;     // ISO time
  data: T;               // event payload
  // optional headers/metadata propagated to targets if needed
  metadata?: Record<string, unknown>;
}
