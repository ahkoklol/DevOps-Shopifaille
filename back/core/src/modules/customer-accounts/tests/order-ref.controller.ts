// back/core/src/modules/customer-accounts/tests/order-ref.controller.test.ts
import router from "../controllers/order-ref.controller.ts";
import { assertEquals } from "jsr:@std/assert";

const mockService = {
  getCustomerOrders: async (id: string) => [
    { order_id: "o1", customer_id: id },
  ],
};

// @ts-ignore
router.routes()[0].middleware[0].service = mockService;

function ctx(method: string, params: any = {}) {
  return {
    params,
    response: {},
    method,
  } as any;
}

Deno.test("GET /customers/:id/orders → retourne commandes", async () => {
  const c = ctx("GET", { customerId: "c55" });

  const route = router.routes().find((r) => r.methods.includes("GET"))!;
  await route.middleware[1](c);

  assertEquals(c.response.body.length, 1);
  assertEquals(c.response.body[0].customer_id, "c55");
});
