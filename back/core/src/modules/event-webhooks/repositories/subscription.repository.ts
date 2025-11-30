// back/core/src/modules/event-webhooks/repositories/subscription.repository.ts

import type { Client } from "postgres";
import { WebhookSubscription } from "../webhook.type.ts";

export class SubscriptionRepository {
  constructor(private db: Client) {}

  async create(data: {
    store_id: string;
    target_url: string;
    secret: string;
    event_types_csv: string;
    active: boolean;
  }): Promise<WebhookSubscription> {
    const result = await this.db.queryObject<WebhookSubscription>(
      `INSERT INTO webhook_subscription
        (store_id, target_url, secret, event_types_csv, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.store_id,
        data.target_url,
        data.secret,
        data.event_types_csv,
        data.active,
      ],
    );

    return result.rows[0];
  }

  async findById(id: string): Promise<WebhookSubscription | null> {
    const result = await this.db.queryObject<WebhookSubscription>(
      `SELECT * FROM webhook_subscription WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async listByStore(storeId: string): Promise<WebhookSubscription[]> {
    const result = await this.db.queryObject<WebhookSubscription>(
      `SELECT * FROM webhook_subscription
         WHERE store_id = $1
         ORDER BY created_at DESC`,
      [storeId],
    );

    return result.rows;
  }

  async updateActiveStatus(
    id: string,
    active: boolean,
  ): Promise<WebhookSubscription> {
    const result = await this.db.queryObject<WebhookSubscription>(
      `UPDATE webhook_subscription
         SET active = $2
         WHERE id = $1
         RETURNING *`,
      [id, active],
    );

    return result.rows[0];
  }

  async findActiveForEvent(
    storeId: string,
    eventType: string,
  ): Promise<WebhookSubscription[]> {
    const pattern = `%${eventType}%`;

    const result = await this.db.queryObject<WebhookSubscription>(
      `SELECT * FROM webhook_subscription
        WHERE store_id = $1
        AND active = TRUE
        AND event_types_csv LIKE $2`,
      [storeId, pattern],
    );

    return result.rows;
  }
}
