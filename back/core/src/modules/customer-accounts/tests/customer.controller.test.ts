// back/core/src/modules/customer-accounts/tests/customer.controller.test.ts

import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createCustomerRouter } from "../controllers/customer.controller.ts";
import { CustomerService } from "../services/customer.service.ts";
import { Application } from "@oak/oak";
import type { Customer } from "../account.type.ts";

// --------------------------------------------------------
// Helper pour construire une app Oak avec router injecté
// --------------------------------------------------------
function buildTestApp(router: ReturnType<typeof createCustomerRouter>) {
  console.log("→ buildTestApp: mounting router");

  const app = new Application();

  app.use((ctx, next) => {
    console.log(
      "→ middleware BEFORE router:",
      ctx.request.method,
      ctx.request.url.toString(),
    );
    return next().then(() => {
      console.log(
        "→ middleware AFTER router, response status:",
        ctx.response.status,
      );
    });
  });

  app.use(router.routes());
  console.log("→ router.routes() mounted");

  app.use(router.allowedMethods());
  console.log("→ router.allowedMethods() mounted");

  return app;
}

// --------------------------------------------------------
// TEST POST /customers
// --------------------------------------------------------
Deno.test("POST /customers creates a customer", async () => {
  console.log("\n\n=== TEST POST START ===");

  const mockService = {
    registerCustomer: (data: { email: string }) => {
      console.log("→ mockService.registerCustomer CALLED");
      return Promise.resolve({
        id: "c1",
        store_id: "s1",
        email: data.email,
        first_name: "John",
        last_name: "Doe",
        is_guest: false,
        created_at: new Date(),
      });
    },
  };

  const spy = stub(
    mockService,
    "registerCustomer",
    mockService.registerCustomer,
  );

  const router = createCustomerRouter(
    mockService as unknown as CustomerService,
  );
  const app = buildTestApp(router);

  const url = "http://test/customers/";
  console.log("→ sending POST request to:", url);

  const req = new Request(url, {
    method: "POST",
    body: JSON.stringify({ email: "a@test.com" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.handle(req);
  console.log("→ RAW RESPONSE:", res);

  if (!res) throw new Error("No response returned by Oak app");

  const text = await res.text();
  console.log("→ response TEXT:", text);

  const body: Customer = JSON.parse(text);

  assertEquals(res.status, 201);
  assertEquals(body.id, "c1");

  assertSpyCalls(spy, 1);

  console.log("=== TEST POST END ===\n\n");
});

// --------------------------------------------------------
// TEST GET /customers/:id — not found
// --------------------------------------------------------
Deno.test("GET /customers/:id returns 404 if missing", async () => {
  console.log("\n\n=== TEST GET 404 START ===");

  const mockService = {
    getCustomerProfile: (id: string) => {
      console.log("→ mockService.getCustomerProfile CALLED with id:", id);
      return Promise.resolve(null);
    },
  };

  const spy = stub(
    mockService,
    "getCustomerProfile",
    mockService.getCustomerProfile,
  );

  const router = createCustomerRouter(
    mockService as unknown as CustomerService,
  );
  const app = buildTestApp(router);

  const url = "http://test/customers/xxx";
  console.log("→ sending GET request to:", url);

  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  console.log("→ RAW RESPONSE:", res);

  if (!res) throw new Error("No response returned by Oak app");

  const text = await res.text();
  console.log("→ response TEXT:", text);

  assertEquals(res.status, 404);
  assertSpyCalls(spy, 1);

  console.log("=== TEST GET 404 END ===\n\n");
});

// --------------------------------------------------------
// TEST GET /customers/:id — OK
// --------------------------------------------------------
Deno.test("GET /customers/:id returns a customer", async () => {
  console.log("\n\n=== TEST GET START ===");

  const mockService = {
    getCustomerProfile: (id: string) => {
      console.log("→ mockService.getCustomerProfile CALLED with id:", id);
      return Promise.resolve({
        id,
        store_id: "s1",
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        is_guest: false,
        created_at: new Date(),
      });
    },
  };

  const spy = stub(
    mockService,
    "getCustomerProfile",
    mockService.getCustomerProfile,
  );

  const router = createCustomerRouter(
    mockService as unknown as CustomerService,
  );
  const app = buildTestApp(router);

  const url = "http://test/customers/42";
  console.log("→ sending GET request to:", url);

  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  console.log("→ RAW RESPONSE:", res);
  if (!res) throw new Error("No response returned by Oak app");
  const text = await res.text();
  console.log("→ response TEXT:", text);

  const body: Customer = JSON.parse(text);

  assertEquals(res.status, 200);
  assertEquals(body.id, "42");

  assertSpyCalls(spy, 1);

  console.log("=== TEST GET END ===\n\n");
});
