import { PaymentTransaction, TxStatus } from "../order.type.ts";
import { PaymentRepository } from "../repositories/payment.repository.ts";

export class PaymentService {
  constructor(private repo: PaymentRepository) {}

  createTransaction(data: {
    order_id: string;
    provider: string;
    reference?: string | null;
    amount: number;
    status?: TxStatus;
  }): Promise<PaymentTransaction> {
    return this.repo.createTx({
      order_id: data.order_id,
      provider: data.provider,
      reference: data.reference ?? null,
      amount: data.amount,
      status: data.status ?? "PENDING",
    });
  }

  listTransactions(orderId: string): Promise<PaymentTransaction[]> {
    return this.repo.listByOrder(orderId);
  }
}
