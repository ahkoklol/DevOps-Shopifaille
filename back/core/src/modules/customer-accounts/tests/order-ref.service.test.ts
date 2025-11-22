import { assertEquals } from "jsr:@std/assert";
import { assertSpyCalls, stub } from "jsr:@std/testing/mock";

import { OrderRefService } from "../services/order-ref.service.ts";

Deno.test("OrderRefService.getCustomerOrders - returns order list", async () => {
  const mockRepo = {
    listOrders() {},
  };

  const listStub = stub(
    mockRepo,
    "listOrders",
    () =>
      Promise.resolve([
        {
          customer_id: "123",
          order_id: "o1",
          placed_at: new Date(),
          status: "paid",
          grand_total: 50,
        },
      ]),
  );

  const service = new OrderRefService();
  // @ts-ignore override repo
  service.repo = mockRepo;

  const result = await service.getCustomerOrders("123");

  assertEquals(result.length, 1);
  assertEquals(result[0].grand_total, 50);
  assertSpyCalls(listStub, 1);

  listStub.restore();
});
