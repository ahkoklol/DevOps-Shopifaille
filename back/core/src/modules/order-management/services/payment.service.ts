// back/core/src/modules/order-management/services/payment.service.ts
import { PaymentTransaction, TxStatus } from "../order.type.ts";
import { PaymentRepository } from "../repositories/payment.repository.ts";

export class PaymentService {
  private repo = new PaymentRepository();

  async createTransaction(data: {
    order_id: string;
    provider: string;
    reference?: string | null;
    amount: number;
    status?: TxStatus;
  }): Promise<PaymentTransaction> {
    return await this.repo.createTx({
      order_id: data.order_id,
      provider: data.provider,
      reference: data.reference ?? null,
      amount: data.amount,
      status: data.status ?? "PENDING",
    });
  }

  async listTransactions(orderId: string): Promise<PaymentTransaction[]> {
    return await this.repo.listByOrder(orderId);
  }
}
