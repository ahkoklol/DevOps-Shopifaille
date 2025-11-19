// back/core/src/modules/order-management/services/order.service.ts
import {
  CreateOrderDto,
  Order,
  OrderItem,
  OrderStatus,
} from "../order.type.ts";
import { OrderRepository } from "../repositories/order.repository.ts";
import { OrderItemRepository } from "../repositories/order-item.repository.ts";
import { OrderLifecycleRepository } from "../repositories/order-lifecycle.repository.ts";
import { OrderStatusEventRepository } from "../repositories/order-status-event.repository.ts";

export class OrderService {
  private orderRepo = new OrderRepository();
  private itemRepo = new OrderItemRepository();
  private lifecycleRepo = new OrderLifecycleRepository();
  private statusEventRepo = new OrderStatusEventRepository();

  async createOrder(dto: CreateOrderDto): Promise<{
    order: Order;
    items: OrderItem[];
  }> {
    const subtotal = dto.items.reduce((sum, item) => {
      return sum + item.qty * item.unit_price;
    }, 0);

    const discount_total = dto.discounts ?? 0;
    const tax_total = dto.tax ?? 0;
    const shipping_total = dto.shipping ?? 0;
    const grand_total = subtotal - discount_total + tax_total + shipping_total;

    const order = await this.orderRepo.createOrderRow({
      customer_id: dto.customer_id,
      contact_email: dto.contact_email,
      currency: dto.currency,
      shipping_address_json: dto.shipping_address_json,
      billing_address_json: dto.billing_address_json,
      subtotal,
      discount_total,
      tax_total,
      shipping_total,
      grand_total,
      status: "CREATED",
    });

    const items = await this.itemRepo.createItemsForOrder(order.id, dto.items);

    await this.lifecycleRepo.upsertLifecycle(order.id, "CREATED");
    await this.statusEventRepo.createEvent({
      order_id: order.id,
      from_status: null,
      to_status: "CREATED",
      reason: "Order created",
      metadata_json: null,
    });

    return { order, items };
  }

  async getOrder(id: string): Promise<Order | null> {
    return await this.orderRepo.findById(id);
  }

  async listOrdersForCustomer(customerId: string): Promise<Order[]> {
    return await this.orderRepo.listByCustomer(customerId);
  }

  async updateStatus(
    orderId: string,
    toStatus: OrderStatus,
    opts?: { reason?: string; metadata?: unknown },
  ): Promise<Order> {
    const existing = await this.orderRepo.findById(orderId);
    if (!existing) {
      throw new Error("Order not found");
    }

    const updated = await this.orderRepo.updateStatus(orderId, toStatus);

    await this.lifecycleRepo.upsertLifecycle(orderId, toStatus);
    await this.statusEventRepo.createEvent({
      order_id: orderId,
      from_status: existing.status,
      to_status: toStatus,
      reason: opts?.reason ?? null,
      metadata_json: opts?.metadata ?? null,
    });

    return updated;
  }
}
