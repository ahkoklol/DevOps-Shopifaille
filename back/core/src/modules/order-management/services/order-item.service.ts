// back/core/src/modules/order-management/services/order-item.service.ts
import { OrderItem } from "../order.type.ts";
import { OrderItemRepository } from "../repositories/order-item.repository.ts";

export class OrderItemService {
  private repo = new OrderItemRepository();

  async listItems(orderId: string): Promise<OrderItem[]> {
    return await this.repo.listByOrder(orderId);
  }
}
