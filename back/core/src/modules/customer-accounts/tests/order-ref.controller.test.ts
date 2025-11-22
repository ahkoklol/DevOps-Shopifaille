// back/core/src/modules/customer-accounts/tests/order-ref.controller.test.ts

import router from "../controllers/order-ref.controller.ts";
import { assertEquals } from "@std/assert";

// === Types utiles ===
interface OrderRef {
  order_id: string;
  customer_id: string;
  placed_at: Date;
  status: string;
  grand_total: number;
}

// === Mock du service ===
const mockService: {
  getCustomerOrders: (customerId: string) => Promise<OrderRef[]>;
} = {
  getCustomerOrders: (id: string) =>
    Promise.resolve([
      {
        order_id: "o1",
        customer_id: id,
        placed_at: new Date(),
        status: "paid",
        grand_total: 50,
      },
    ]),
};

// Oak ne fournit pas de type public pour routes().
// On utilise un cast manuel avec justification.
// @ts-ignore: Oak retourne un type interne non-exporté → cast manuel nécessaire pour les tests
const routes = [...(router.routes() as IterableIterator<{
  methods: string[];
  middleware: unknown[];
}>)];

// Injection du mock dans les handlers
for (const r of routes) {
  const handler = r.middleware[1];
  if (typeof handler === "function") {
    // @ts-ignore: injection volontaire d’un mock pour test unitaire
    handler.service = mockService;
  }
}

// === Contexte mock Oak ===
interface TestCtx {
  params: Record<string, string>;
  response: Record<string, unknown>;
  state: Record<string, unknown>;
  method: string;
}

function createCtx(
  method: string,
  params: Record<string, string> = {},
): TestCtx {
  return {
    params,
    response: {},
    state: {},
    method,
  };
}

// === TEST ===

Deno.test("GET /customers/:id/orders → retourne commandes", async () => {
  const route = routes.find((r) => r.methods.includes("GET"))!;
  const handler = route.middleware[1] as (ctx: TestCtx) => Promise<void>;

  const ctx = createCtx("GET", { customerId: "c55" });
  await handler(ctx);

  const body = ctx.response.body as OrderRef[];

  assertEquals(body.length, 1);
  assertEquals(body[0].customer_id, "c55");
});
