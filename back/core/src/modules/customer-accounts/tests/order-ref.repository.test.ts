// back/core/src/modules/customer-accounts/tests/order-ref.repository.test.ts
import { OrderRefRepository } from "../repositories/order-ref.repository.ts";
import { assert, assertEquals } from "@std/assert";
import type { Client } from "postgres";

Deno.test("OrderRefRepository.listOrders", async () => {
  const fakeDb = {
    queryObject: () =>
      Promise.resolve({
        rows: [{ order_id: "1", status: "paid" }],
      }),
  };

  const repo = new OrderRefRepository(fakeDb as unknown as Client);
  const rows = await repo.listOrders("c1");

  assertEquals(rows.length, 1);
  assertEquals(rows[0].order_id, "1");
});

Deno.test("OrderRefRepository.addOrderRef inserts and returns row", async () => {
  const fakeDb = {
    queryObject: (_query: string, params: unknown[]) =>
      Promise.resolve({
        rows: [
          {
            customer_id: params[0],
            order_id: params[1],
            placed_at: params[2],
            status: params[3],
            grand_total: params[4],
          },
        ],
      }),
  };

  const repo = new OrderRefRepository(fakeDb as unknown as Client);

  const result = await repo.addOrderRef({
    customer_id: "c1",
    order_id: "o99",
    placed_at: new Date(),
    status: "paid",
    grand_total: 200,
  });

  assert(result);
  assertEquals(result.order_id, "o99");
  assertEquals(result.status, "paid");
});

Deno.test("OrderRefRepository.updateStatus", async () => {
  const fakeDb = {
    queryObject: () =>
      Promise.resolve({
        rows: [{ order_id: "1", status: "shipped" }],
      }),
  };

  const repo = new OrderRefRepository(fakeDb as unknown as Client);
  const updated = await repo.updateStatus("1", "shipped");

  assertEquals(updated.status, "shipped");
});
