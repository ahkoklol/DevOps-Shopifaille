import { ReturnRepository } from "../repositories/return.repository.ts";
import { OrderRepository } from "../repositories/order.repository.ts";
import { CreateReturnDTO, ReturnRecord } from "../return.type.ts";
import { EventBusService } from "./event-bus.service.ts";
import { ProductsClientService } from "./products-client.service.ts";

export class ReturnService {
  constructor(
    private returns: ReturnRepository,
    private orders: OrderRepository,
    private bus: EventBusService,
    private products: ProductsClientService,
  ) {}

  async create(orderId: string, dto: CreateReturnDTO) {
    const order = await this.orders.findById(orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    // Increment stock for returned items
    await this.products.incrementStock(dto.items.map(i => ({ variantId: i.variantId, quantity: i.quantity })));

    // Compute refund (very basic)
    const refund =
      dto.refundAmount ??
      dto.items.reduce((s, it) => {
        const line = order.items.find(x => x.variantId === it.variantId);
        return s + (line ? line.unitPrice * it.quantity : 0);
      }, 0);

    const rec: ReturnRecord = {
      id: crypto.randomUUID(),
      orderId,
      items: dto.items,
      refundAmount: refund,
      reason: dto.reason,
      createdAt: new Date().toISOString(),
      type: refund < order.totalAmount ? "PARTIAL" : "TOTAL",
    };

    await this.returns.create(rec);

    // Update order status
    const newStatus = rec.type === "TOTAL" ? "REFUNDED" : "PARTIALLY_REFUNDED";
    await this.orders.updateStatus(orderId, newStatus);

    await this.bus.publish("order.refunded", {
      orderId,
      type: rec.type.toLowerCase(),
      refundAmount: refund,
    });

    return { return: rec, status: newStatus };
  }

  async list(orderId: string) {
    return this.returns.list(orderId);
  }
}
