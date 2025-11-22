import { assertEquals, assertSpyCalls, stub } from "jsr:@std/testing@0.225.0/mock";
import { OrderRefService } from "../services/order-ref.service.ts";
import { OrderRefRepository } from "../repositories/order-ref.repository.ts";

Deno.test("OrderRefService.getCustomerOrders - returns order list", async () => {
  const mockRepo = {
    listOrders: stub(() =>
      Promise.resolve([
        { id: "o1", customer_id: "123", amount: 50 },
      ])
    ),
  };

  const service = new OrderRefService();
  // @ts-ignore
  service.repo = mockRepo;

  const result = await service.getCustomerOrders("123");

  assertEquals(result.length, 1);
  assertEquals(result[0].amount, 50);
  assertSpyCalls(mockRepo.listOrders, 1);
});
