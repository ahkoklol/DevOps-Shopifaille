// back/core/src/modules/customer-accounts/tests/order-ref.service.test.ts
import { assertEquals } from "@std/assert";
import { OrderRefService } from "../services/order-ref.service.ts";
import type { OrderRefRepository } from "../repositories/order-ref.repository.ts";

Deno.test("OrderRefService.getCustomerOrders returns repo data", async () => {
  const fakeRepo = {
    listOrders: (customer_id: string) =>
      Promise.resolve([
        {
          customer_id,
          order_id: "o55",
          placed_at: new Date(),
          status: "paid",
          grand_total: 120,
        },
      ]),
  };

  const service = new OrderRefService(
    fakeRepo as unknown as OrderRefRepository,
  );

  const rows = await service.getCustomerOrders("100");

  assertEquals(rows.length, 1);
  assertEquals(rows[0].order_id, "o55");
  assertEquals(rows[0].customer_id, "100");
});
