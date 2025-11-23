// back/core/src/modules/order-management/repositories/order-item.repository.ts
import { connectToModuleDB } from "../../../shared/db/index.ts";
import { OrderItem } from "../order.type.ts";

const db = await connectToModuleDB("order-management");

export class OrderItemRepository {
  async createItemsForOrder(
    orderId: string,
    items: Array<{
      product_id: string;
      variant_id: string;
      qty: number;
      unit_price: number;
      title: string;
      sku: string;
      attrs?: unknown;
    }>,
  ): Promise<OrderItem[]> {
    const created: OrderItem[] = [];

    for (const item of items) {
      const lineTotal = item.qty * item.unit_price;

      const result = await db.queryObject<OrderItem>(
        `INSERT INTO order_item (
           order_id,
           product_id,
           variant_id,
           title_snapshot,
           sku_snapshot,
           attributes_snapshot_json,
           unit_price,
           qty,
           line_total
         )
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9)
         RETURNING *`,
        [
          orderId,
          item.product_id,
          item.variant_id,
          item.title,
          item.sku,
          item.attrs ? JSON.stringify(item.attrs) : null,
          item.unit_price,
          item.qty,
          lineTotal,
        ],
      );

      created.push(result.rows[0]);
    }

    return created;
  }

  async listByOrder(orderId: string): Promise<OrderItem[]> {
    const result = await db.queryObject<OrderItem>(
      `SELECT *
       FROM order_item
       WHERE order_id = $1
       ORDER BY id`,
      [orderId],
    );
    return result.rows;
  }
}
