import { connectToModuleDB } from "../../../shared/db/index.ts";
import { WebhookDelivery } from "../webhook.type.ts";

const db = await connectToModuleDB("webhooks");

export class DeliveryRepository {
  async create(data: {
    subscription_id: string;
    event_type: string;
    payload_json: unknown;
  }): Promise<WebhookDelivery> {
    const result = await db.queryObject<WebhookDelivery>(
      `INSERT INTO webhook_delivery
        (subscription_id, event_type, payload_json, status, attempts)
       VALUES ($1, $2, $3::jsonb, 'PENDING', 0)
       RETURNING *`,
      [
        data.subscription_id,
        data.event_type,
        JSON.stringify(data.payload_json),
      ],
    );

    return result.rows[0];
  }

  async updateStatus(
    id: string,
    status: WebhookDelivery["status"],
    attempts: number,
  ): Promise<WebhookDelivery> {
    const result = await db.queryObject<WebhookDelivery>(
      `UPDATE webhook_delivery
         SET status = $2,
             attempts = $3,
             last_attempt_at = NOW()
         WHERE id = $1
         RETURNING *`,
      [id, status, attempts],
    );

    return result.rows[0];
  }

  async findById(id: string): Promise<WebhookDelivery | null> {
    const result = await db.queryObject<WebhookDelivery>(
      `SELECT * FROM webhook_delivery WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async listBySubscription(subscriptionId: string): Promise<WebhookDelivery[]> {
    const result = await db.queryObject<WebhookDelivery>(
      `SELECT * FROM webhook_delivery
        WHERE subscription_id = $1
        ORDER BY last_attempt_at DESC NULLS LAST, id DESC`,
      [subscriptionId],
    );
    return result.rows;
  }
}
