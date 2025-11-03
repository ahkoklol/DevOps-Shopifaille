import { Order, OrderItem, OrderStatus, OrderTimelineEvent } from "../order.type.ts";

export class OrderRepository {
  private orders = new Map<string, Order>();
  private idempotency = new Map<string, string>(); // key -> orderId

  async save(order: Order) {
    this.orders.set(order.id, order);
    return order;
  }

  async findById(id: string) {
    return this.orders.get(id) ?? null;
  }

  async findByStore(storeId: string, params?: { status?: OrderStatus; from?: string; to?: string }) {
    const list = Array.from(this.orders.values()).filter(o => o.storeId === storeId);
    return list.filter(o => {
      if (params?.status && o.status !== params.status) return false;
      if (params?.from && o.createdAt < params.from) return false;
      if (params?.to && o.createdAt > params.to) return false;
      return true;
    });
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    const o = this.orders.get(orderId);
    if (!o) return null;
    o.status = status;
    o.updatedAt = new Date().toISOString();
    o.timeline.push({ at: o.updatedAt, type: "STATUS_CHANGED", payload: { status } });
    this.orders.set(orderId, o);
    return o;
  }

  async appendTimeline(orderId: string, ev: OrderTimelineEvent) {
    const o = this.orders.get(orderId);
    if (!o) return null;
    o.timeline.push(ev);
    o.updatedAt = ev.at;
    this.orders.set(orderId, o);
    return o;
  }

  async putIdempotency(key: string, orderId: string) {
    this.idempotency.set(key, orderId);
  }

  async getByIdempotency(key: string) {
    const id = this.idempotency.get(key);
    return id ? await this.findById(id) : null;
  }

  async aggregates(storeId: string, from?: string, to?: string) {
    const orders = await this.findByStore(storeId, { from, to });
    const paid = orders.filter(o => ["CONFIRMED","PREPARING","SHIPPED","DELIVERED","PARTIALLY_REFUNDED","REFUNDED"].includes(o.status));
    const total = paid.reduce((s, o) => s + o.totalAmount, 0);
    const count = paid.length;
    const aov = count ? total / count : 0;
    return { total, orders_count: count, aov };
  }
}
