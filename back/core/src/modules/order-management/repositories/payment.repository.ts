// back/core/src/modules/order-management/repositories/payment.repository.ts
import { connectToModuleDB } from "../../../shared/db/index.ts";
import { PaymentTransaction, TxStatus } from "../order.type.ts";

const db = await connectToModuleDB("order-management");

export class PaymentRepository {
  async createTx(data: {
    order_id: string;
    provider: string;
    reference?: string | null;
    amount: number;
    status: TxStatus;
  }): Promise<PaymentTransaction> {
    const result = await db.queryObject<PaymentTransaction>(
      `INSERT INTO payment_transaction (
         order_id,
         provider,
         reference,
         amount,
         status,
         created_at
       )
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING *`,
      [
        data.order_id,
        data.provider,
        data.reference ?? null,
        data.amount,
        data.status,
      ],
    );
    return result.rows[0];
  }

  async listByOrder(orderId: string): Promise<PaymentTransaction[]> {
    const result = await db.queryObject<PaymentTransaction>(
      `SELECT *
       FROM payment_transaction
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [orderId],
    );
    return result.rows;
  }
}
