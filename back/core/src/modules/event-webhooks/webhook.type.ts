export type WebhookFormat = "json" | "cloudevents+json";
export type WebhookStatus = "active" | "paused" | "disabled";

export interface WebhookEndpoint {
  id: string;
  storeId: string;
  url: string;
  topics: string[];           // e.g., ["order.created@v1", "order.status.updated@v1"]
  format: WebhookFormat;
  version: string;            // default version hint (e.g., "v1")
  secret: string;             // current secret
  prevSecret?: string;        // previous secret (during grace period)
  secretGraceUntil?: string;  // ISO end of grace overlap period
  customHeaders?: Record<string, string>;
  rateLimitQps?: number;      // optional per-endpoint throttling
  status: WebhookStatus;
  createdAt: string;
  updatedAt: string;
}
