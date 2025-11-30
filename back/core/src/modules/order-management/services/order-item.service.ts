import { OrderItem } from "../order.type.ts";
import { OrderItemRepository } from "../repositories/order-item.repository.ts";

export class OrderItemService {
  constructor(private repo: OrderItemRepository) {}

  listItems(orderId: string): Promise<OrderItem[]> {
    return this.repo.listByOrder(orderId);
  }

  createItems(
    orderId: string,
    items: Array<{
      product_id: string;
      variant_id: string;
      qty: number;
      unit_price: number;
      title: string;
      sku: string;
      attrs?: unknown;
    }>,
  ): Promise<OrderItem[]> {
    return this.repo.createItemsForOrder(orderId, items);
  }
}
