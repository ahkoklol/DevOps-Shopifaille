import { assertEquals } from "@std/assert";
import type { Client } from "postgres";
import { OrderRepository } from "../repositories/order.repository.ts";

interface FakeDB {
  queryObject: (
    query: string,
    params: unknown[],
  ) => Promise<{ rows: unknown[] }>;
}

Deno.test("OrderRepository.findById returns row or null", async () => {
  const fakeSuccessDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "1" }] }),
  };
  const repoSuccess = new OrderRepository(fakeSuccessDB as unknown as Client);
  const row = await repoSuccess.findById("1");
  assertEquals(row?.id, "1");

  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };
  const repoEmpty = new OrderRepository(fakeEmptyDB as unknown as Client);
  const empty = await repoEmpty.findById("x");
  assertEquals(empty, null);
});

Deno.test("OrderRepository.listByCustomer returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "1" }, { id: "2" }] }),
  };
  const repo = new OrderRepository(fakeDB as unknown as Client);
  const results = await repo.listByCustomer("cust_1");

  assertEquals(results.length, 2);
});

Deno.test("OrderRepository.createOrderRow returns created row", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({ rows: [{ id: "1", customer_id: "c1" }] }),
  };
  const repo = new OrderRepository(fakeDB as unknown as Client);
  const result = await repo.createOrderRow({
    customer_id: "c1",
    contact_email: "test@test.com",
    currency: "USD",
    shipping_address_json: {},
    subtotal: 100,
    discount_total: 0,
    tax_total: 10,
    shipping_total: 5,
    grand_total: 115,
    status: "CREATED",
  });

  assertEquals(result.customer_id, "c1");
});

Deno.test("OrderRepository.updateStatus updates and returns row", async () => {
  const fakeDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "1", status: "PAID" }] }),
  };
  const repo = new OrderRepository(fakeDB as unknown as Client);
  const result = await repo.updateStatus("1", "PAID");

  assertEquals(result.id, "1");
  assertEquals(result.status, "PAID");
});
