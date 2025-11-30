import { assertEquals } from "@std/assert";
import type { Client } from "postgres";
import { PaymentRepository } from "../repositories/payment.repository.ts";

interface FakeDB {
  queryObject: (
    query: string,
    params: unknown[],
  ) => Promise<{ rows: unknown[] }>;
}

Deno.test("PaymentRepository.createTx inserts and returns row", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [{ order_id: "1", provider: "stripe", amount: 100 }],
      }),
  };
  const repo = new PaymentRepository(fakeDB as unknown as Client);
  const result = await repo.createTx({
    order_id: "1",
    provider: "stripe",
    amount: 100,
    status: "PENDING",
  });

  assertEquals(result.order_id, "1");
  assertEquals(result.provider, "stripe");
});

Deno.test("PaymentRepository.listByOrder returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({ rows: [{ order_id: "1" }, { order_id: "1" }] }),
  };
  const repo = new PaymentRepository(fakeDB as unknown as Client);
  const results = await repo.listByOrder("1");

  assertEquals(results.length, 2);
});
