// back/core/src/modules/customer-accounts/tests/order-ref.controller.test.ts
import router from "../controllers/order-ref.controller.ts";
import { assertEquals } from "jsr:@std/assert";

// --- Mock du service ---
const mockService = {
  getCustomerOrders: async (id: string) => [
    {
      order_id: "o1",
      customer_id: id,
      placed_at: new Date(),
      status: "paid",
      grand_total: 50,
    },
  ],
};

// Récupération des routes comme dans address.controller.test.ts
const routes = [...(router.routes() as unknown as IterableIterator<any>)];

// Injection du mock dans les handlers
for (const r of routes) {
  const handler = r.middleware[1]; // handler du contrôleur
  if (handler) {
    // @ts-ignore
    handler.service = mockService;
  }
}

// Fake context — même style que address.controller.test.ts
function createCtx(method: string, params: any = {}) {
  return {
    params,
    response: {},
    state: {},
    method,
  } as any;
}

// ---- TEST ----

Deno.test("GET /customers/:id/orders → retourne commandes", async () => {
  const route = routes.find((r) => r.methods.includes("GET"))!;
  const handler = route.middleware[1];

  const ctx = createCtx("GET", { customerId: "c55" });
  await handler(ctx, () => {});

  assertEquals(ctx.response.body.length, 1);
  assertEquals(ctx.response.body[0].customer_id, "c55");
});
