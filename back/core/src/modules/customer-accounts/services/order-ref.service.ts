// back/core/src/modules/customer-accounts/services/order-ref.service.ts
import type { OrderRefRepository } from "../repositories/order-ref.repository.ts";
import type { CustomerOrderRef } from "../account.type.ts";

export class OrderRefService {
  constructor(private repo: OrderRefRepository) {}

  async getCustomerOrders(customer_id: string): Promise<CustomerOrderRef[]> {
    return await this.repo.listOrders(customer_id);
  }
}
