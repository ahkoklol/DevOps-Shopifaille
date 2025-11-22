// back/core/src/modules/customer-accounts/tests/order_ref.repository.test.ts
import { OrderRefRepository } from "../repositories/order-ref.repository.ts";
import { assertEquals } from "@std/assert";
import type { Client } from "postgres";

Deno.test("OrderRefRepository.listOrders", async () => {
  const fakeDb = {
    queryObject: () => ({
      rows: [{ order_id: "1", status: "paid" }],
    }),
  };

  const repo = new OrderRefRepository(
    Promise.resolve(fakeDb as unknown as Client),
  );
  const rows = await repo.listOrders("c1");

  assertEquals(rows.length, 1);
  assertEquals(rows[0].order_id, "1");
});

Deno.test("OrderRefRepository.updateStatus", async () => {
  const fakeDb = {
    queryObject: () => ({
      rows: [{ order_id: "1", status: "shipped" }],
    }),
  };

  const repo = new OrderRefRepository(
    Promise.resolve(fakeDb as unknown as Client),
  );
  const updated = await repo.updateStatus("1", "shipped");

  assertEquals(updated.status, "shipped");
});
