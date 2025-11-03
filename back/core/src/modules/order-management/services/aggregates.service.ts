import { OrderRepository } from "../repositories/order.repository.ts";

export class AggregatesService {
  constructor(private orders: OrderRepository) {}

  async getSummary(storeId: string, range?: { from?: string; to?: string }) {
    return this.orders.aggregates(storeId, range?.from, range?.to);
  }
}
