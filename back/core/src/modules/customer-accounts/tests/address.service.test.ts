// back/core/src/modules/customer-accounts/controllers/address.controller.test.ts
import { assertEquals } from "jsr:@std/assert";
import { assertSpyCalls, stub } from "jsr:@std/testing/mock";
import router from "../controllers/address.controller.ts";

// Prépare l'accès aux handlers du router Oak
function getRoute(method: string, path: string) {
  const routes = (router as any).routes();
  for (const r of routes) {
    if (r.method === method && r.path === path) return r;
  }
  throw new Error("Route not found");
}

Deno.test("GET /customers/:customerId/addresses → returns list", async () => {
  const handler = getRoute("GET", "/customers/:customerId/addresses/");

  const mockService = { listAddresses: () => {} };
  const listStub = stub(
    mockService,
    "listAddresses",
    () =>
      Promise.resolve([
        { id: "1", customer_id: "123", line1: "Rue A", city: "Paris" },
      ]),
  );

  // @ts-ignore override
  router.__service = mockService;

  const ctx = {
    params: { customerId: "123" },
    response: { body: undefined as any },
  };

  await handler(ctx);

  assertEquals(ctx.response.body[0].city, "Paris");
  assertSpyCalls(listStub, 1);
});

Deno.test("POST /customers/:customerId/addresses → creates address", async () => {
  const handler = getRoute("POST", "/customers/:customerId/addresses/");

  const mockService = { addAddress: () => {} };
  const createStub = stub(
    mockService,
    "addAddress",
    () =>
      Promise.resolve({
        id: "1",
        customer_id: "123",
        line1: "Rue X",
        city: "Lyon",
      }),
  );

  // @ts-ignore override
  router.__service = mockService;

  const ctx = {
    params: { customerId: "123" },
    request: {
      body: {
        json: () => ({ line1: "Rue X" }),
      },
    },
    response: { status: 0, body: undefined as any },
  };

  await handler(ctx);

  assertEquals(ctx.response.status, 201);
  assertEquals(ctx.response.body.city, "Lyon");
  assertSpyCalls(createStub, 1);
});
