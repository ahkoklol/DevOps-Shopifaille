// back/core/src/modules/customer-accounts/tests/address.controller.test.ts
import router from "../controllers/address.controller.ts";
import { assertEquals } from "jsr:@std/assert";

// --- Mock du service ---
const mockService = {
  listAddresses: async (id: string) => [{ id: "a1", customer_id: id }],
  addAddress: async (data: any) => ({ id: "a2", ...data }),
};

const routes = [...(router.routes() as unknown as IterableIterator<any>)];

// Injection du mock dans les handlers
for (const r of routes) {
  const handler = r.middleware[1]; // le vrai handler
  if (handler) {
    // @ts-ignore
    handler.service = mockService;
  }
}

function createCtx(method: string, params: any = {}, body: any = null) {
  return {
    params,
    request: {
      body: {
        json: async () => body,
      },
    },
    response: {},
    state: {},
    method,
  } as any;
}

Deno.test("GET /customers/:id/addresses → retourne liste", async () => {
  const route = routes.find((r) => r.methods.includes("GET"))!;
  const handler = route.middleware[1];

  const ctx = createCtx("GET", { customerId: "c1" });
  await handler(ctx, () => {});

  assertEquals(ctx.response.body.length, 1);
  assertEquals(ctx.response.body[0].customer_id, "c1");
});

Deno.test("POST /customers/:id/addresses → ajoute une adresse", async () => {
  const route = routes.find((r) => r.methods.includes("POST"))!;
  const handler = route.middleware[1];

  const ctx = createCtx("POST", { customerId: "c1" }, { line1: "Rue X" });
  await handler(ctx, () => {});

  assertEquals(ctx.response.status, 201);
  assertEquals(ctx.response.body.customer_id, "c1");
});
