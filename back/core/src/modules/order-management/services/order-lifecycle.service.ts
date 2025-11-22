// back/core/src/modules/order-management/services/order-lifecycle.service.ts
import { OrderLifecycle, OrderStatus } from "../order.type.ts";
import { OrderLifecycleRepository } from "../repositories/order-lifecycle.repository.ts";

export class OrderLifecycleService {
  private repo = new OrderLifecycleRepository();

  async getLifecycle(orderId: string): Promise<OrderLifecycle | null> {
    return await this.repo.findByOrder(orderId);
  }

  async setStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderLifecycle> {
    return await this.repo.upsertLifecycle(orderId, status);
  }
}
