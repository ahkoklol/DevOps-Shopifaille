// back/core/src/modules/admin-accounts/tests/admin.controller.test.ts

import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createAdminRouter } from "../controllers/admin.controller.ts";
import { AdminService } from "../services/admin.service.ts";
import { Application } from "@oak/oak";
import type { Admin } from "../admin.type.ts";

// --------------------------------------------------------
// Helper pour construire une app Oak avec router injecté
// --------------------------------------------------------
function buildTestApp(router: ReturnType<typeof createAdminRouter>) {
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
// TEST POST /admins
// --------------------------------------------------------
Deno.test("POST /admins creates a admin", async () => {
  console.log("\n\n=== TEST POST START ===");

  const mockService = {
    registerAdmin: (data: { email: string }) => {
      console.log("→ mockService.registerAdmin CALLED");
      return Promise.resolve({
        id: "c1",
        email: data.email,
        first_name: "John",
        last_name: "Doe",
        created_at: new Date(),
      });
    },
  };

  const spy = stub(
    mockService,
    "registerAdmin",
    mockService.registerAdmin,
  );

  const router = createAdminRouter(
    mockService as unknown as AdminService,
  );
  const app = buildTestApp(router);

  const url = "http://test/admins/";
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

  const body: Admin = JSON.parse(text);

  assertEquals(res.status, 201);
  assertEquals(body.id, "c1");

  assertSpyCalls(spy, 1);

  console.log("=== TEST POST END ===\n\n");
});

// --------------------------------------------------------
// TEST GET /admins/:id — not found
// --------------------------------------------------------
Deno.test("GET /admins/:id returns 404 if missing", async () => {
  console.log("\n\n=== TEST GET 404 START ===");

  const mockService = {
    getAdminProfile: (id: string) => {
      console.log("→ mockService.getAdminProfile CALLED with id:", id);
      return Promise.resolve(null);
    },
  };

  const spy = stub(
    mockService,
    "getAdminProfile",
    mockService.getAdminProfile,
  );

  const router = createAdminRouter(
    mockService as unknown as AdminService,
  );
  const app = buildTestApp(router);

  const url = "http://test/admins/xxx";
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
// TEST GET /admins/:id — OK
// --------------------------------------------------------
Deno.test("GET /admins/:id returns an admin", async () => {
  console.log("\n\n=== TEST GET START ===");

  const mockService = {
    getAdminProfile: (id: string) => {
      console.log("→ mockService.getAdminProfile CALLED with id:", id);
      return Promise.resolve({
        id,
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        created_at: new Date(),
      });
    },
  };

  const spy = stub(
    mockService,
    "getAdminProfile",
    mockService.getAdminProfile,
  );

  const router = createAdminRouter(
    mockService as unknown as AdminService,
  );
  const app = buildTestApp(router);

  const url = "http://test/admins/42";
  console.log("→ sending GET request to:", url);

  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  console.log("→ RAW RESPONSE:", res);
  if (!res) throw new Error("No response returned by Oak app");
  const text = await res.text();
  console.log("→ response TEXT:", text);

  const body: Admin = JSON.parse(text);

  assertEquals(res.status, 200);
  assertEquals(body.id, "42");

  assertSpyCalls(spy, 1);

  console.log("=== TEST GET END ===\n\n");
});
