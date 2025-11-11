export type UUID = string;

export interface WebhookSubscription {
  id: UUID;
  store_id: UUID;
  target_url: string;
  secret: string;
  event_types_csv: string;
  active: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: UUID;
  subscription_id: UUID;
  event_type: string;
  payload_json: unknown;
  status: 'PENDING' | 'SENT' | 'FAILED';
  attempts: number;
  last_attempt_at?: string | null;
}

export interface SubscribeDto {
  store_id: UUID;
  target_url: string;
  secret: string;
  event_types: string[]; // ex: ["order.created","order.paid"]
  active?: boolean;
}
