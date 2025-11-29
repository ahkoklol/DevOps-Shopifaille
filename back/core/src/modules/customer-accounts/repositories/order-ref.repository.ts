// back/core/src/modules/customer-accounts/repositories/order_ref.repository.ts
import type { Client } from "postgres";
import { CustomerOrderRef } from "../account.type.ts";

export class OrderRefRepository {
  constructor(private db: Client) {}

  async listOrders(customerId: string): Promise<CustomerOrderRef[]> {
    const result = await this.db.queryObject<CustomerOrderRef>(
      `SELECT * FROM customer_order_ref
       WHERE customer_id = $1
       ORDER BY placed_at DESC`,
      [customerId],
    );
    return result.rows;
  }

  async addOrderRef(
    data: Partial<CustomerOrderRef>,
  ): Promise<CustomerOrderRef> {
    const result = await this.db.queryObject<CustomerOrderRef>(
      `INSERT INTO customer_order_ref (customer_id, order_id, placed_at, status, grand_total)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        data.customer_id,
        data.order_id,
        data.placed_at ?? new Date(),
        data.status ?? "created",
        data.grand_total ?? 0,
      ],
    );
    return result.rows[0];
  }

  async updateStatus(
    orderId: string,
    status: string,
  ): Promise<CustomerOrderRef> {
    const result = await this.db.queryObject<CustomerOrderRef>(
      `UPDATE customer_order_ref
       SET status = $2
       WHERE order_id = $1
       RETURNING *`,
      [orderId, status],
    );
    return result.rows[0];
  }
}
