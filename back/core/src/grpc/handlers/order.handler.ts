// handlers/order.handler.ts
import { UUID } from "../../modules/order-management/order.type.ts";
import {
  Order,
  OrderStatus,
} from "../../modules/order-management/order.type.ts";

export const service = undefined; // sera remplacé par le stub gRPC réel

export const implementation = {
  PlaceOrder: (
    call: {
      request: { customer_id: UUID; contact_email: string; currency: string };
    },
  ): Promise<{ success: boolean; order: Order }> => {
    const now = new Date().toISOString();
    const order: Order = {
      id: "ORDER-123" as UUID, // mock UUID
      customer_id: call.request.customer_id,
      contact_email: call.request.contact_email,
      subtotal: 100,
      discount_total: 10,
      tax_total: 5,
      shipping_total: 15,
      grand_total: 110,
      currency: call.request.currency,
      status: "CREATED" as OrderStatus,
      shipping_address_json: { line1: "123 Main St", city: "Demo City" },
      billing_address_json: { line1: "123 Main St", city: "Demo City" },
      created_at: now,
    };

    // ✅ Retourne un vrai Promise sans async
    return Promise.resolve({
      success: true,
      order,
    });
  },
};
