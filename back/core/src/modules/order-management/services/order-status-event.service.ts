import { OrderStatus, OrderStatusEvent } from "../order.type.ts";
import { OrderStatusEventRepository } from "../repositories/order-status-event.repository.ts";

export class OrderStatusEventService {
  constructor(private repo: OrderStatusEventRepository) {}

  createEvent(data: {
    order_id: string;
    from_status?: OrderStatus | null;
    to_status: OrderStatus;
    reason?: string | null;
    metadata_json?: unknown;
  }): Promise<OrderStatusEvent> {
    return this.repo.createEvent(data);
  }

  listByOrder(orderId: string): Promise<OrderStatusEvent[]> {
    return this.repo.listByOrder(orderId);
  }
}
