// back/core/src/modules/customer-accounts/tests/address.controller.test.ts

import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createAddressRouter } from "../controllers/address.controller.ts";
import { AddressService } from "../services/address.service.ts";
import { Application } from "@oak/oak";
import { CustomerAddress } from "../account.type.ts";

// Utilitaire pour monter un router Oak 12 dans une app testable
function buildTestApp(router: ReturnType<typeof createAddressRouter>) {
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

//
// TEST GET
//
Deno.test("GET /customers/:customerId/addresses returns list", async () => {
  console.log("\n\n=== TEST GET START ===");

  const mockService = {
    listAddresses: () => {
      console.log("→ mockService.listAddresses CALLED");
      return Promise.resolve([
        {
          id: "1",
          customer_id: "abc",
          type: "shipping",
          line1: "",
          city: "Paris",
          region: "",
          postal_code: "",
          country: "",
          is_default: false,
        },
      ]);
    },
  };

  const spy = stub(
    mockService,
    "listAddresses",
    mockService.listAddresses,
  );

  const router = createAddressRouter(
    mockService as unknown as AddressService,
  );

  const app = buildTestApp(router);

  const url = "http://test/customers/abc/addresses/";
  console.log("→ sending GET request to:", url);

  const req = new Request(url, {
    method: "GET",
  });

  const res = await app.handle(req);

  console.log("→ RAW RESPONSE:", res);

  if (!res) throw new Error("No response returned by Oak app");

  const text = await res.text();
  console.log("→ response TEXT:", text);

  let body: CustomerAddress[] | null = null;
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
    assertEquals(body[0].city, "Paris");
  }

  assertSpyCalls(spy, 1);

  console.log("=== TEST GET END ===\n\n");
});

//
// TEST POST
//
Deno.test("POST /customers/:customerId/addresses creates address", async () => {
  console.log("\n\n=== TEST POST START ===");

  const mockService = {
    addAddress: () => {
      console.log("→ mockService.addAddress CALLED");
      return Promise.resolve({
        id: "99",
        customer_id: "abc",
        line1: "Rue Test",
      });
    },
  };

  const spy = stub(
    mockService,
    "addAddress",
    mockService.addAddress,
  );

  const router = createAddressRouter(
    mockService as unknown as AddressService,
  );

  const app = buildTestApp(router);

  const url = "http://test/customers/abc/addresses/";
  console.log("→ sending POST request to:", url);

  const req = new Request(url, {
    method: "POST",
    body: JSON.stringify({ line1: "Rue Test" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.handle(req);

  console.log("→ RAW RESPONSE:", res);

  if (!res) throw new Error("No response returned by Oak app");

  const text = await res.text();
  console.log("→ response TEXT:", text);

  let body: CustomerAddress | null = null;
  if (text.length > 0) {
    body = JSON.parse(text);
    console.log("→ parsed JSON:", body);
  }

  assertEquals(res.status, 201);
  assertEquals(body?.customer_id, "abc");
  assertSpyCalls(spy, 1);

  console.log("=== TEST POST END ===\n\n");
});
