// back/core/src/modules/customer-accounts/tests/order-ref.controller.test.ts

import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createOrderRefRouter } from "../controllers/order-ref.controller.ts";
import { Application } from "@oak/oak";
import type { OrderRefService } from "../services/order-ref.service.ts";
import type { CustomerOrderRef } from "../account.type.ts";

// --------------------------------------------------------
// Helper identique à address.controller.test.ts
// --------------------------------------------------------
function buildTestApp(router: ReturnType<typeof createOrderRefRouter>) {
  console.log("→ buildTestApp: mounting router");

  const app = new Application();

  // middleware debug
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
// TEST GET /customers/:customerId/orders
// --------------------------------------------------------
Deno.test("GET /customers/:customerId/orders returns list", async () => {
  console.log("\n\n=== TEST ORDER GET START ===");

  const mockService = {
    getCustomerOrders: (customerId: string) => {
      console.log("→ mockService.getCustomerOrders CALLED");
      return Promise.resolve([
        {
          order_id: "o1",
          customer_id: customerId,
          placed_at: new Date(),
          status: "paid",
          grand_total: 90,
        },
      ]);
    },
  };

  const spy = stub(
    mockService,
    "getCustomerOrders",
    mockService.getCustomerOrders,
  );

  const router = createOrderRefRouter(
    mockService as unknown as OrderRefService,
  );

  const app = buildTestApp(router);

  const url = "http://test/customers/abc/orders/";
  console.log("→ sending GET request to:", url);

  const req = new Request(url, { method: "GET" });

  const res = await app.handle(req);

  console.log("→ RAW RESPONSE:", res);
  if (!res) throw new Error("No response returned by Oak app");

  const text = await res.text();
  console.log("→ response TEXT:", text);

  let body: CustomerOrderRef[] | null = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
      console.log("→ parsed JSON:", body);
    } catch (e) {
      console.log("→ JSON parse error:", e);
    }
  } else {
    console.log("→ EMPTY JSON BODY");
  }

  if (body) {
    assertEquals(body[0].customer_id, "abc");
    assertEquals(body[0].order_id, "o1");
  }

  assertSpyCalls(spy, 1);

  console.log("=== TEST ORDER GET END ===\n\n");
});
