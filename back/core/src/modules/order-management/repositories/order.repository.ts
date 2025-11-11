import { pool, sql } from '../../../config/database';
import type {
  Order, OrderItem, PaymentTransaction, OrderStatusEvent, OrderLifecycle, OrderStatus, TxStatus
} from '../order.type';

export const OrderRepository = {
  async insertOrderWithItems(input: {
    orderBase: Omit<Order, "id" | "status" | "created_at" | "subtotal" | "grand_total" | "discount_total" | "tax_total" | "shipping_total"> & {
      currency: string;
    };
    items: Array<{ product_id: string; variant_id: string; qty: number; unit_price: number; title: string; sku: string; attrs?: unknown; }>;
    amounts: { subtotal: number; discount: number; tax: number; shipping: number; grand: number; };
  }): Promise<Order> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderRes = await client.query<Order>(
        `INSERT INTO "order" (customer_id, contact_email, subtotal, discount_total, tax_total, shipping_total, grand_total, currency, status, shipping_address_json, billing_address_json)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'CREATED',$9,$10)
         RETURNING *`,
        [
          input.orderBase.customer_id,
          input.orderBase.contact_email,
          input.amounts.subtotal,
          input.amounts.discount,
          input.amounts.tax,
          input.amounts.shipping,
          input.amounts.grand,
          input.orderBase.currency,
          JSON.stringify(input.orderBase.shipping_address_json),
          JSON.stringify(input.orderBase.billing_address_json ?? null)
        ]
      );
      const order = orderRes.rows[0];

      for (const it of input.items) {
        await client.query(
          `INSERT INTO order_item (order_id, product_id, variant_id, title_snapshot, sku_snapshot, attributes_snapshot_json, unit_price, qty, line_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            order.id,
            it.product_id,
            it.variant_id,
            it.title,
            it.sku,
            JSON.stringify(it.attrs ?? {}),
            it.unit_price,
            it.qty,
            it.unit_price * it.qty
          ]
        );
      }

      await client.query(
        `INSERT INTO order_lifecycle (order_id, current_status) VALUES ($1,'CREATED')`,
        [order.id]
      );

      await client.query(
        `INSERT INTO order_status_event (order_id, from_status, to_status, reason) VALUES ($1, NULL, 'CREATED', 'order created')`,
        [order.id]
      );

      await client.query('COMMIT');
      return order;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async appendStatus(orderId: string, to: OrderStatus, reason?: string, meta?: unknown) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const cur = await client.query<{ current_status: OrderStatus }>(
        `SELECT current_status FROM order_lifecycle WHERE order_id=$1 FOR UPDATE`,
        [orderId]
      );

      await client.query(
        `UPDATE order_lifecycle SET current_status=$1, updated_at=now() WHERE order_id=$2`,
        [to, orderId]
      );

      await client.query(
        `INSERT INTO order_status_event (order_id, from_status, to_status, reason, metadata_json)
         VALUES ($1,$2,$3,$4,$5)`,
        [orderId, cur.rows[0]?.current_status ?? null, to, reason ?? null, JSON.stringify(meta ?? {})]
      );

      await client.query('COMMIT');
      return to;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async recordPayment(tx: Omit<PaymentTransaction, "id" | "created_at">): Promise<PaymentTransaction> {
    const r = await sql<PaymentTransaction>`
      INSERT INTO payment_transaction (order_id, provider, reference, amount, status)
      VALUES (${tx.order_id}, ${tx.provider}, ${tx.reference ?? null}, ${tx.amount}, ${tx.status})
      RETURNING *`;
    return r[0];
  },

  async getOrderWithItems(orderId: string): Promise<Order & { items: OrderItem[] }> {
    const [o] = await sql<Order>`SELECT * FROM "order" WHERE id=${orderId}`;
    if (!o) throw new Error('Order not found');
    const items = await sql<OrderItem>`SELECT * FROM order_item WHERE order_id=${orderId} ORDER BY id`;
    return { ...o, items };
  }
};
