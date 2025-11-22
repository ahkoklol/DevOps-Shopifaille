// back/core/src/modules/customer-accounts/tests/customer.controller.test.ts
import router from "../controllers/customer.controller.ts";
import { assertEquals } from "jsr:@std/assert";

// --- Mock du service conforme au type Customer ---
const mockService = {
  registerCustomer: async (data: any) => ({
    id: "c1",
    store_id: "s1",
    email: data.email,
    first_name: "John",
    last_name: "Doe",
    is_guest: false,
    created_at: new Date(),
  }),

  getCustomerProfile: async (id: string) =>
    id === "x" ? null : {
      id,
      store_id: "s1",
      email: "test@test.com",
      first_name: "John",
      last_name: "Doe",
      is_guest: false,
      created_at: new Date(),
    },
};

// Récupération des routes comme Oak Iterable
const routes = [...(router.routes() as unknown as IterableIterator<any>)];

// Injection mock dans middleware[1]
for (const r of routes) {
  const handler = r.middleware[1];
  if (handler) {
    // @ts-ignore
    handler.service = mockService;
  }
}

// Fake ctx
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

// TESTS ======================================================

Deno.test("POST /customers → crée un client", async () => {
  const route = routes.find((r) => r.methods.includes("POST"))!;
  const handler = route.middleware[1];

  const ctx = createCtx("POST", {}, { email: "a@test.com" });
  await handler(ctx);

  assertEquals(ctx.response.status, 201);
  assertEquals(ctx.response.body.id, "c1");
});

Deno.test("GET /customers/:id → 404 si non trouvé", async () => {
  const route = routes.find((r) => r.path.includes("/:id"))!;
  const handler = route.middleware[1];

  const ctx = createCtx("GET", { id: "x" });
  await handler(ctx);

  assertEquals(ctx.response.status, 404);
});

Deno.test("GET /customers/:id → retourne client", async () => {
  const route = routes.find((r) => r.path.includes("/:id"))!;
  const handler = route.middleware[1];

  const ctx = createCtx("GET", { id: "42" });
  await handler(ctx);

  assertEquals(ctx.response.body.id, "42");
});
