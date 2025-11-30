import { OrderLifecycle, OrderStatus } from "../order.type.ts";
import { OrderLifecycleRepository } from "../repositories/order-lifecycle.repository.ts";

export class OrderLifecycleService {
  constructor(private repo: OrderLifecycleRepository) {}

  getLifecycle(orderId: string): Promise<OrderLifecycle | null> {
    return this.repo.findByOrder(orderId);
  }

  setStatus(orderId: string, status: OrderStatus): Promise<OrderLifecycle> {
    return this.repo.upsertLifecycle(orderId, status);
  }
}
