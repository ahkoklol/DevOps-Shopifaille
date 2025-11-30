import type { Client } from "postgres";
import { OrderStatus, OrderStatusEvent } from "../order.type.ts";

export class OrderStatusEventRepository {
  constructor(private db: Client) {}

  async createEvent(data: {
    order_id: string;
    from_status?: OrderStatus | null;
    to_status: OrderStatus;
    reason?: string | null;
    metadata_json?: unknown;
  }): Promise<OrderStatusEvent> {
    const result = await this.db.queryObject<OrderStatusEvent>(
      `INSERT INTO order_status_event (
         order_id,
         from_status,
         to_status,
         reason,
         occurred_at,
         metadata_json
       )
       VALUES ($1,$2,$3,$4,NOW(),$5::jsonb)
       RETURNING *`,
      [
        data.order_id,
        data.from_status ?? null,
        data.to_status,
        data.reason ?? null,
        data.metadata_json ? JSON.stringify(data.metadata_json) : null,
      ],
    );
    return result.rows[0];
  }

  async listByOrder(orderId: string): Promise<OrderStatusEvent[]> {
    const result = await this.db.queryObject<OrderStatusEvent>(
      `SELECT * FROM order_status_event WHERE order_id = $1 ORDER BY occurred_at ASC`,
      [orderId],
    );
    return result.rows;
  }
}
