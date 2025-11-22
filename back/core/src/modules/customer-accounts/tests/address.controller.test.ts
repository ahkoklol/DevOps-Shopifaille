import router from "../controllers/address.controller.ts";
import { assertEquals } from "@std/assert";

// --- Types utiles ---
interface Address {
  id: string;
  customer_id: string;
}

interface AddAddressInput {
  line1: string;
}

// --- Mock du service ---
const mockService: {
  listAddresses: (id: string) => Promise<Address[]>;
  addAddress: (
    data: AddAddressInput & { customer_id: string },
  ) => Promise<Address>;
} = {
  listAddresses: (id: string) =>
    Promise.resolve([{ id: "a1", customer_id: id }]),

  addAddress: (data) => Promise.resolve({ id: "a2", ...data }),
};

// On doit forcer le type car Oak ne donne pas un type public pour routes().
// @ts-ignore: Oak retourne un type interne non-exporté → cast manuel nécessaires pour tests
const routes = [
  ...(router.routes() as IterableIterator<
    { methods: string[]; middleware: unknown[] }
  >),
];

// Injection du mock dans les handlers
for (const r of routes) {
  const handler = r.middleware[1];
  if (typeof handler === "function") {
    // @ts-ignore: injection volontaire dans le handler pour le test
    handler.service = mockService;
  }
}

// --- Contexte mocké Oak ---
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

// ------------------ TESTS ------------------

Deno.test("GET /customers/:id/addresses → retourne liste", async () => {
  const route = routes.find((r) => r.methods.includes("GET"))!;
  const handler = route.middleware[1] as (ctx: TestCtx) => Promise<void>;

  const ctx = createCtx("GET", { customerId: "c1" });
  await handler(ctx);

  assertEquals((ctx.response.body as Address[]).length, 1);
  assertEquals((ctx.response.body as Address[])[0].customer_id, "c1");
});

Deno.test("POST /customers/:id/addresses → ajoute une adresse", async () => {
  const route = routes.find((r) => r.methods.includes("POST"))!;
  const handler = route.middleware[1] as (ctx: TestCtx) => Promise<void>;

  const ctx = createCtx("POST", { customerId: "c1" }, { line1: "Rue X" });
  await handler(ctx);

  const body = ctx.response.body as Address;
  assertEquals(ctx.response.status, 201);
  assertEquals(body.customer_id, "c1");
});
