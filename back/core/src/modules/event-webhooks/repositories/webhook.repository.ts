import { sql } from '../../../config/database';
import type { WebhookSubscription, WebhookDelivery } from '../webhook.type';

export const WebhookRepository = {
  async createSubscription(dto: { store_id: string; target_url: string; secret: string; event_types: string[]; active?: boolean; }) {
    const r = await sql<WebhookSubscription>`
      INSERT INTO webhook_subscription (store_id, target_url, secret, event_types_csv, active)
      VALUES (${dto.store_id}, ${dto.target_url}, ${dto.secret}, ${dto.event_types.join(',')}, ${dto.active ?? true})
      RETURNING *`;
    return r[0];
  },

  async listSubscriptionsForEvent(eventType: string) {
    // match naïf par LIKE ; si tu veux plus strict, stocke en array et utilises ANY()
    return sql<WebhookSubscription>`
      SELECT * FROM webhook_subscription
      WHERE active = true AND event_types_csv ILIKE ${'%' + eventType + '%'}`;
  },

  async insertDelivery(d: { subscription_id: string; event_type: string; payload_json: unknown; }) {
    const r = await sql<WebhookDelivery>`
      INSERT INTO webhook_delivery (subscription_id, event_type, payload_json, status, attempts)
      VALUES (${d.subscription_id}, ${d.event_type}, ${JSON.stringify(d.payload_json)}::jsonb, 'PENDING', 0)
      RETURNING *`;
    return r[0];
  },

  markAttempt(deliveryId: string, ok: boolean) {
    return sql`
      UPDATE webhook_delivery
      SET status=${ok ? 'SENT' : 'FAILED'}, attempts=attempts+1, last_attempt_at=now()
      WHERE id=${deliveryId}`;
  },

  listDeliveriesBySubscription(subscriptionId: string) {
    return sql<WebhookDelivery>`
      SELECT * FROM webhook_delivery
      WHERE subscription_id=${subscriptionId}
      ORDER BY last_attempt_at DESC NULLS LAST, id DESC`;
  },

  async getDeliveryById(id: string) {
    const r = await sql<WebhookDelivery>`SELECT * FROM webhook_delivery WHERE id=${id}`;
    return r[0] ?? null;
  }
};
