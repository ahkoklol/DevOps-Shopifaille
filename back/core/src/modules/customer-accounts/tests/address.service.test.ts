import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import router from "../controllers/address.controller.ts";

// Types minimaux pour éviter any
interface TestContext {
  params: Record<string, string>;
  request?: {
    body?: {
      json: () => unknown;
    };
  };
  response: {
    status?: number;
    body?: unknown;
  };
}

// Typage minimal du router Oak
interface OakRoute {
  method: string;
  path: string;
  handler: (ctx: TestContext) => Promise<void> | void;
}

// Fonction utilitaire typée
function getRoute(method: string, path: string): OakRoute["handler"] {
  const routes = (router.routes() as unknown as Iterable<OakRoute>);
  for (const r of routes) {
    if (r.method === method && r.path === path) {
      return r.handler;
    }
  }
  throw new Error("Route not found");
}

Deno.test("GET /customers/:customerId/addresses → returns list", async () => {
  const handler = getRoute("GET", "/customers/:customerId/addresses/");

  const mockService = {
    listAddresses: () =>
      Promise.resolve([
        { id: "1", customer_id: "123", line1: "Rue A", city: "Paris" },
      ]),
  };

  // Remplace le service interne du router pour le test
  (router as unknown as { __service: unknown }).__service = mockService;

  const ctx: TestContext = {
    params: { customerId: "123" },
    response: {},
  };

  const listStub = stub(mockService, "listAddresses");

  await handler(ctx);

  assertEquals((ctx.response.body as { city: string }[])[0].city, "Paris");
  assertSpyCalls(listStub, 1);
});

Deno.test("POST /customers/:customerId/addresses → creates address", async () => {
  const handler = getRoute("POST", "/customers/:customerId/addresses/");

  const mockService = {
    addAddress: () =>
      Promise.resolve({
        id: "1",
        customer_id: "123",
        line1: "Rue X",
        city: "Lyon",
      }),
  };

  // Remplace le service interne du router
  (router as unknown as { __service: unknown }).__service = mockService;

  const ctx: TestContext = {
    params: { customerId: "123" },
    request: {
      body: {
        json: () => ({ line1: "Rue X" }),
      },
    },
    response: {},
  };

  const createStub = stub(mockService, "addAddress");

  await handler(ctx);

  assertEquals(ctx.response.status, 201);
  assertEquals((ctx.response.body as { city: string }).city, "Lyon");
  assertSpyCalls(createStub, 1);
});
