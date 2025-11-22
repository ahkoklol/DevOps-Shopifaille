// back/core/src/modules/customer-accounts/tests/customer.controller.test.ts

import router from "../controllers/customer.controller.ts";
import { assertEquals } from "@std/assert";

// === Types utiles ===
interface Customer {
  id: string;
  store_id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_guest: boolean;
  created_at: Date;
}

// === Mock du service ===
const mockService: {
  registerCustomer: (data: { email: string }) => Promise<Customer>;
  getCustomerProfile: (id: string) => Promise<Customer | null>;
} = {
  registerCustomer: (data) =>
    Promise.resolve({
      id: "c1",
      store_id: "s1",
      email: data.email,
      first_name: "John",
      last_name: "Doe",
      is_guest: false,
      created_at: new Date(),
    }),

  getCustomerProfile: (id) =>
    id === "x" ? Promise.resolve(null) : Promise.resolve({
      id,
      store_id: "s1",
      email: "test@test.com",
      first_name: "John",
      last_name: "Doe",
      is_guest: false,
      created_at: new Date(),
    }),
};

// === Récupération des routes ===
// @ts-ignore: Oak retourne un type interne non-exporté → cast manuel nécessaire pour les tests
const routes = [
  ...(router.routes() as IterableIterator<{
    methods: string[];
    path: string;
    middleware: unknown[];
  }>),
];

// === Injection du mock dans les handlers ===
for (const r of routes) {
  const handler = r.middleware[1];
  if (typeof handler === "function") {
    // @ts-ignore: injection volontaire d’un mock dans handler pour test unitaire
    handler.service = mockService;
  }
}

// === Contexte mock Oak ===
interface TestCtx {
  params: Record<string, string>;
  request: {
    body: {
      json: () => Promise<unknown>;
    };
  };
  response: Record<string, unknown>;
  state: Record<string, unknown>;
  method: string;
}

function createCtx(
  method: string,
  params: Record<string, string> = {},
  body: unknown = null,
): TestCtx {
  return {
    params,
    request: {
      body: {
        json: () => Promise.resolve(body),
      },
    },
    response: {},
    state: {},
    method,
  };
}

// ======================= TESTS =======================

Deno.test("POST /customers → crée un client", async () => {
  const route = routes.find((r) => r.methods.includes("POST"))!;
  const handler = route.middleware[1] as (ctx: TestCtx) => Promise<void>;

  const ctx = createCtx("POST", {}, { email: "a@test.com" });
  await handler(ctx);

  const body = ctx.response.body as Customer;

  assertEquals(ctx.response.status, 201);
  assertEquals(body.id, "c1");
});

Deno.test("GET /customers/:id → 404 si non trouvé", async () => {
  const route = routes.find((r) => r.path.includes("/:id"))!;
  const handler = route.middleware[1] as (ctx: TestCtx) => Promise<void>;

  const ctx = createCtx("GET", { id: "x" });
  await handler(ctx);

  assertEquals(ctx.response.status, 404);
});

Deno.test("GET /customers/:id → retourne client", async () => {
  const route = routes.find((r) => r.path.includes("/:id"))!;
  const handler = route.middleware[1] as (ctx: TestCtx) => Promise<void>;

  const ctx = createCtx("GET", { id: "42" });
  await handler(ctx);

  const customer = ctx.response.body as Customer;

  assertEquals(customer.id, "42");
});
