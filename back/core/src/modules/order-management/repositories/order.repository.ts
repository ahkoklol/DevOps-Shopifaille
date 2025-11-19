// back/core/src/modules/order-management/repositories/order.repository.ts
import { connectToModuleDB } from "../../../shared/db/index.ts";
import { 
  CreateOrderDto,
  Order,
  OrderItem, 
  OrderStatus, 
} from "../order.type.ts";

const db = await connectToModuleDB("order-management");

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const result = await db.queryObject<Order>(
      `SELECT * FROM orders WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async listByCustomer(customerId: string): Promise<Order[]> {
    const result = await db.queryObject<Order>(
      `SELECT *
       FROM orders
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [customerId],
    );
    return result.rows;
  }

  async createOrderRow(
    data: {
      customer_id: string;
      contact_email: string;
      currency: string;
      shipping_address_json: unknown;
      billing_address_json?: unknown | null;
      subtotal: number;
      discount_total: number;
      tax_total: number;
      shipping_total: number;
      grand_total: number;
      status: OrderStatus;
    },
  ): Promise<Order> {
    const result = await db.queryObject<Order>(
      `INSERT INTO orders (
         customer_id,
         contact_email,
         subtotal,
         discount_total,
         tax_total,
         shipping_total,
         grand_total,
         currency,
         status,
         shipping_address_json,
         billing_address_json,
         created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,NOW())
       RETURNING *`,
      [
        data.customer_id,
        data.contact_email,
        data.subtotal,
        data.discount_total,
        data.tax_total,
        data.shipping_total,
        data.grand_total,
        data.currency,
        data.status,
        JSON.stringify(data.shipping_address_json),
        data.billing_address_json 
        ? JSON.stringify(data.billing_address_json) 
        : null,
      ],
    );

    return result.rows[0];
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const result = await db.queryObject<Order>(
      `UPDATE orders
       SET status = $2
       WHERE id = $1
       RETURNING *`,
      [id, status],
    );
    return result.rows[0];
  }
}
