import type { Client } from "postgres";
import { OrderLifecycle, OrderStatus } from "../order.type.ts";

export class OrderLifecycleRepository {
  constructor(private db: Client) {}

  async upsertLifecycle(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderLifecycle> {
    const result = await this.db.queryObject<OrderLifecycle>(
      `INSERT INTO order_lifecycle (order_id, current_status, created_at, updated_at)
       VALUES ($1,$2,NOW(),NOW())
       ON CONFLICT (order_id)
       DO UPDATE SET current_status = $2, updated_at = NOW()
       RETURNING *`,
      [orderId, status],
    );
    return result.rows[0];
  }

  async findByOrder(orderId: string): Promise<OrderLifecycle | null> {
    const result = await this.db.queryObject<OrderLifecycle>(
      `SELECT * FROM order_lifecycle WHERE order_id = $1`,
      [orderId],
    );
    return result.rows[0] ?? null;
  }
}
