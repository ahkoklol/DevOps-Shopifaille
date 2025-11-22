// back/core/src/modules/customer-accounts/tests/customer.controller.test.ts
import router from "../controllers/customer.controller.ts";
import { assertEquals } from "jsr:@std/assert";

const mockService = {
  registerCustomer: async (data: any) => ({ id: "c1", ...data }),
  getCustomerProfile: async (id: string) =>
    id === "x" ? null : { id, email: "test@test.com" },
};

// Remplacement interne du service utilisé par le router
// @ts-ignore
router.routes()[0].middleware[0].service = mockService;

function ctx(method: string, params = {}, body: any = null) {
  return {
    params,
    request: {
      body: {
        json: async () => body,
      },
    },
    response: {},
    method,
  } as any;
}

Deno.test("POST /customers → crée un client", async () => {
  const c = ctx("POST", {}, { email: "a@test.com" });

  const route = router.routes().find((r) => r.methods.includes("POST"))!;
  await route.middleware[1](c);

  assertEquals(c.response.status, 201);
  assertEquals(c.response.body.id, "c1");
});

Deno.test("GET /customers/:id → 404 si non trouvé", async () => {
  const c = ctx("GET", { id: "x" });

  const route = router.routes().find((r) => r.path.includes("/:id"))!;
  await route.middleware[1](c);

  assertEquals(c.response.status, 404);
});

Deno.test("GET /customers/:id → retourne client", async () => {
  const c = ctx("GET", { id: "42" });

  const route = router.routes().find((r) => r.path.includes("/:id"))!;
  await route.middleware[1](c);

  assertEquals(c.response.body.id, "42");
});
