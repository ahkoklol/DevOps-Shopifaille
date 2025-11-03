import * as grpc from "npm:@grpc/grpc-js";
import * as protoloader from "npm:@grpc/proto-loader";

// Import your module services (paths à ajuster si besoin)
import { OrderRepository } from "../../modules/order-management/repositories/order.repository.ts";
import { ReturnRepository } from "../../modules/order-management/repositories/return.repository.ts";
import { EventBusService } from "../../modules/order-management/services/event-bus.service.ts";
import { ProductsClientService } from "../../modules/order-management/services/products-client.service.ts";
import { OrderService } from "../../modules/order-management/services/order.service.ts";
import { ReturnService } from "../../modules/order-management/services/return.service.ts";
import { AggregatesService } from "../../modules/order-management/services/aggregates.service.ts";

export function makeOrderHandlers() {
  const repos = {
    orders: new OrderRepository(),
    returns: new ReturnRepository(),
  };
  const externals = {
    bus: new EventBusService(),
    products: new ProductsClientService(),
  };
  const svcs = {
    order: new OrderService(repos.orders, externals.products, externals.bus),
    ret: new ReturnService(repos.returns, repos.orders, externals.bus, externals.products),
    aggr: new AggregatesService(repos.orders),
  };

  const impl: Record<string, grpc.handleUnaryCall<any, any>> = {
    PlaceOrder: async (call, cb) => {
      try {
        const b = call.request;
        const out = await svcs.order.placeOrder({
          idempotencyKey: b.idempotency_key || undefined,
          storeId: b.store_id,
          customerId: b.customer_id || null,
          currency: b.currency,
          items: (b.items ?? []).map((i: any) => ({
            productId: i.product_id,
            variantId: i.variant_id,
            quantity: i.quantity,
            unitPrice: i.unit_price,
          })),
          totals: {
            subtotal: b.totals?.subtotal ?? 0,
            taxAmount: b.totals?.tax_amount ?? 0,
            shippingCost: b.totals?.shipping_cost ?? 0,
            total: b.totals?.total ?? 0,
          },
        });
        cb(null, { order: toProtoOrder(out) });
      } catch (e) { cb(err(e)); }
    },

    GetOrder: async (call, cb) => {
      try {
        const row = await svcs.order.getOne(call.request.id);
        cb(null, row ? { order: toProtoOrder(row) } : {});
      } catch (e) { cb(err(e)); }
    },

    ListOrders: async (call, cb) => {
      try {
        const list = await svcs.order.listByStore(call.request.store_id, {
          status: call.request.status || undefined,
          from: call.request.from || undefined,
          to: call.request.to || undefined,
        } as any);
        cb(null, { orders: list.map(toProtoOrder) });
      } catch (e) { cb(err(e)); }
    },

    UpdateStatus: async (call, cb) => {
      try {
        const out = await svcs.order.updateStatus(call.request.id, {
          status: fromStatusEnum(call.request.status),
        });
        cb(null, { order: toProtoOrder(out!) });
      } catch (e) { cb(err(e)); }
    },

    MarkPaid: async (call, cb) => {
      try {
        const out = await svcs.order.markPaid(call.request.id, call.request.tx_id, call.request.amount);
        cb(null, { order: toProtoOrder(out) });
      } catch (e) { cb(err(e)); }
    },

    CreateReturn: async (call, cb) => {
      try {
        const b = call.request;
        const out = await svcs.ret.create(b.order_id, {
          items: (b.items ?? []).map((i: any) => ({ variantId: i.variant_id, quantity: i.quantity })),
          reason: b.reason || undefined,
          refundAmount: b.refund_amount || undefined,
        });
        cb(null, {
          rec: {
            id: out.return.id,
            order_id: out.return.orderId,
            type: out.return.type,
            refund_amount: out.return.refundAmount,
            reason: out.return.reason ?? "",
            created_at: out.return.createdAt,
          },
          new_status: toStatusEnum(out.status),
        });
      } catch (e) { cb(err(e)); }
    },

    ListReturns: async (call, cb) => {
      try {
        const rows = await svcs.ret.list(call.request.order_id);
        cb(null, { items: rows.map(r => ({
          id: r.id,
          order_id: r.orderId,
          type: r.type,
          refund_amount: r.refundAmount,
          reason: r.reason ?? "",
          created_at: r.createdAt,
        }))});
      } catch (e) { cb(err(e)); }
    },

    GetAggregates: async (call, cb) => {
      try {
        const out = await svcs.aggr.getSummary(call.request.store_id, {
          from: call.request.from || undefined,
          to: call.request.to || undefined,
        });
        cb(null, { total: out.total, orders_count: out.orders_count, aov: out.aov });
      } catch (e) { cb(err(e)); }
    },

    ValidateDiscount: async (_call, cb) => {
      // Stub simple: always invalid (à brancher si tu as un service Promotions)
      cb(null, { valid: false, reason: "NOT_IMPLEMENTED" });
    },
  };

  return impl;
}

function err(e: any): grpc.ServiceError {
  return { code: grpc.status.UNKNOWN, name: e?.name ?? "Error", message: e?.message ?? String(e) } as any;
}

function toProtoOrder(o: any) {
  return {
    id: o.id,
    store_id: o.storeId,
    customer_id: o.customerId ?? "",
    status: toStatusEnum(o.status),
    total_amount: o.totalAmount,
    tax_amount: o.taxAmount,
    shipping_cost: o.shippingCost,
    currency: o.currency,
    items: (o.items ?? []).map((i: any) => ({
      id: i.id,
      order_id: i.orderId,
      product_id: i.productId,
      variant_id: i.variantId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    })),
    created_at: o.createdAt,
    updated_at: o.updatedAt,
    timeline: (o.timeline ?? []).map((t: any) => ({
      at: t.at,
      type: t.type,
      payload_json: t.payload ? JSON.stringify(t.payload).slice(0, 4000) : "",
    })),
    transaction_id: o.transactionId ?? "",
  };
}

function toStatusEnum(s: string) {
  switch (s) {
    case "PENDING_PAYMENT": return 1;
    case "CONFIRMED": return 2;
    case "PREPARING": return 3;
    case "SHIPPED": return 4;
    case "DELIVERED": return 5;
    case "CANCELED": return 6;
    case "PARTIALLY_REFUNDED": return 7;
    case "REFUNDED": return 8;
    case "FAILED": return 9;
    default: return 0;
  }
}

function fromStatusEnum(n: number): any {
  const map: Record<number,string> = {
    1:"PENDING_PAYMENT",2:"CONFIRMED",3:"PREPARING",4:"SHIPPED",5:"DELIVERED",6:"CANCELED",7:"PARTIALLY_REFUNDED",8:"REFUNDED",9:"FAILED"
  };
  return map[n] ?? "CONFIRMED";
}
