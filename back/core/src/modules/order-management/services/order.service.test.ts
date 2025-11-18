// src/modules/order-management/services/order.service.test.ts
import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";

// Service à tester
import { OrderService } from "./order.service.ts";

// On importe le module du repo et des events pour pouvoir les surcharger
import * as Repo from "../repositories/order.repository.ts";
import * as Events from "../../../shared/events.ts";

// --------- helpers / fixtures ---------

function sampleDto() {
  return {
    customer_id: "cust_123",
    contact_email: "test@example.com",
    shipping_address_json: { city: "Paris" },
    billing_address_json: null,
    currency: "EUR",
    items: [
      {
        product_id: "p1",
        variant_id: "v1",
        qty: 2,
        unit_price: 10,
        title: "T-Shirt",
        sku: "TSHIRT",
      },
      {
        product_id: "p2",
        variant_id: "v2",
        qty: 1,
        unit_price: 5,
        title: "Mug",
        sku: "MUG",
      },
    ],
    discounts: 0,
    tax: 0,
    shipping: 0,
  };
}

// ======================================================================
//                                 TESTS
// ======================================================================

Deno.test("createOrder() calcule bien les totaux et utilise le repository", async () => {
  const dto = sampleDto();

  // On mocke la fonction du repository utilisée par le service
  (Repo as any).OrderRepository = {
    insertOrderWithItems: async (orderData: any, items: any[]) => {
      return {
        id: "order_1",
        status: "PENDING",
        ...orderData,
        items,
      };
    },
  };

  // On mocke publish pour éviter les effets de bord
  (Events as any).publish = () => Promise.resolve();

  const created = await OrderService.createOrder(dto);

  assertExists(created.id);
  // 2 × 10 + 1 × 5 = 25
  assertEquals(created.subtotal, 25);
  assertEquals(created.grand, 25);
  assertEquals(created.items.length, 2);
});

Deno.test("getOrder() renvoie bien la commande et ses items", async () => {
  (Repo as any).OrderRepository = {
    getOrderWithItems: async (id: string) => ({
      id,
      customer_id: "cust_1",
      items: [{ id: "i1", product_id: "p1", qty: 1, unit_price: 10 }],
    }),
  };

  const order = await OrderService.getOrder("order_42");

  assertExists(order);
  assertEquals(order.id, "order_42");
  assertEquals(order.items.length, 1);
});

Deno.test("capturePayment() appelle updatePaymentStatus et publish", async () => {
  let updateCalled = false;
  let publishCalled = false;

  (Repo as any).OrderRepository = {
    updatePaymentStatus: async (
      orderId: string,
      provider: string,
      reference: string,
      amount: number,
    ) => {
      updateCalled = true;
      return { id: orderId, payment_status: "CAPTURED", provider, reference, amount };
    },
  };

  (Events as any).publish = async () => {
    publishCalled = true;
  };

  await OrderService.capturePayment("order_1", "stripe", "ref123", 50);

  assert(updateCalled, "updatePaymentStatus doit être appelé");
  assert(publishCalled, "publish doit être appelé");
});

Deno.test("cancelOrder() publie un événement d'annulation", async () => {
  let publishCalled = false;

  (Repo as any).OrderRepository = {
    getOrderWithItems: async (id: string) => ({
      id,
      status: "PENDING",
      items: [],
    }),
    cancel: async (id: string, _reason?: string) => ({
      id,
      status: "CANCELLED",
    }),
  };

  (Events as any).publish = async () => {
    publishCalled = true;
  };

  await OrderService.cancelOrder("order_1", "customer request");

  assert(publishCalled, "publish doit être appelé lors de l'annulation");
});
