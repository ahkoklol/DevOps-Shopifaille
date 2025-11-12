import { OrderRefRepository } from "../repositories/order-ref.repository.ts";
import { CustomerOrderRef } from "../account.type.ts";

export class OrderRefService {
  private repo = new OrderRefRepository();

  async getCustomerOrders(customer_id: string): Promise<CustomerOrderRef[]> {
    return this.repo.findByCustomer(customer_id);
  }
}