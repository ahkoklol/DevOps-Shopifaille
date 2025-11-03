import { EventBusService } from "./event-bus.service.ts";
import { ProductsClientService } from "./products-client.service.ts";
import {
  Order, OrderItem, OrderStatus, PlaceOrderDTO, UpdateStatusDTO,
} from "../order.type.ts";
import { OrderRepository } from "../repositories/order.repository.ts";

export class OrderService {
  constructor(
    private orders: OrderRepository,
    private products: ProductsClientService,
    private bus: EventBusService,
  ) {}

  async placeOrder(dto: PlaceOrderDTO) {
    // Idempotency
    if (dto.idempotencyKey) {
      const existing = await this.orders.getByIdempotency(dto.idempotencyKey);
      if (existing) return existing;
    }

    // Basic validation
    if (!dto.items?.length) throw new Error("EMPTY_ITEMS");
    const now = new Date().toISOString();

    // Try to decrement stock
    const ok = await this.products.decrementStock(
      dto.items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
    );
    if (!ok) {
      const failed: Order = {
        id: crypto.randomUUID(),
        storeId: dto.storeId,
        customerId: dto.customerId ?? null,
        status: "FAILED",
        totalAmount: dto.totals.total,
        taxAmount: dto.totals.taxAmount,
        shippingCost: dto.totals.shippingCost,
        currency: dto.currency,
        items: [],
        createdAt: now,
        updatedAt: now,
        timeline: [{ at: now, type: "FAILED", payload: { reason: "OUT_OF_STOCK" } }],
        transactionId: null,
      };
      await this.orders.save(failed);
      await this.bus.publish("order.failed", { orderId: failed.id, reason: "OUT_OF_STOCK" });
      if (dto.idempotencyKey) await this.orders.putIdempotency(dto.idempotencyKey, failed.id);
      return failed;
    }

    // Create order & items
    const orderId = crypto.randomUUID();
    const items: OrderItem[] = dto.items.map(i => ({
      id: crypto.randomUUID(),
      orderId,
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    const order: Order = {
      id: orderId,
      storeId: dto.storeId,
      customerId: dto.customerId ?? null,
      status: "CONFIRMED", // payment may be simulated by Checkout
      totalAmount: dto.totals.total,
      taxAmount: dto.totals.taxAmount,
      shippingCost: dto.totals.shippingCost,
      currency: dto.currency,
      items,
      createdAt: now,
      updatedAt: now,
      timeline: [{ at: now, type: "CREATED", payload: { subtotal: dto.totals.subtotal } }],
      transactionId: null,
    };

    await this.orders.save(order);
    await this.bus.publish("order.created", { orderId, storeId: order.storeId, total: order.totalAmount });
    if (dto.idempotencyKey) await this.orders.putIdempotency(dto.idempotencyKey, orderId);

    return order;
    // Note: for real payments, status may start at PENDING_PAYMENT and be moved to CONFIRMED on webhook.
  }

  async markPaid(orderId: string, txId: string, amount: number) {
    const o = await this.orders.findById(orderId);
    if (!o) throw new Error("ORDER_NOT_FOUND");
    // Simple verification
    if (amount !== o.totalAmount) throw new Error("AMOUNT_MISMATCH");

    o.transactionId = txId;
    o.status = "CONFIRMED";
    const at = new Date().toISOString();
    o.timeline.push({ at, type: "PAID", payload: { txId } });
    o.updatedAt = at;
    await this.orders.save(o);
    await this.bus.publish("order.paid", { orderId, txId });
    return o;
  }

  async updateStatus(orderId: string, dto: UpdateStatusDTO) {
    const updated = await this.orders.updateStatus(orderId, dto.status);
    if (!updated) throw new Error("ORDER_NOT_FOUND");

    await this.bus.publish("order.status.updated", { orderId, status: dto.status });
    // Compensation for cancel
    if (dto.status === "CANCELED") {
      await this.products.incrementStock(updated.items.map(i => ({ variantId: i.variantId, quantity: i.quantity })));
    }
    return updated;
  }

  async getOne(orderId: string) {
    return this.orders.findById(orderId);
  }

  async listByStore(storeId: string, q?: { status?: OrderStatus; from?: string; to?: string }) {
    return this.orders.findByStore(storeId, q);
  }

  async aggregates(storeId: string, range?: { from?: string; to?: string }) {
    return this.orders.aggregates(storeId, range?.from, range?.to);
  }
}
