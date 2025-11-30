import { assertEquals } from "@std/assert";
import type { Client } from "postgres";
import { OrderStatusEventRepository } from "../repositories/order-status-event.repository.ts";
import type { OrderStatusEvent } from "../order.type.ts";

interface FakeDB {
  queryObject: (
    query: string,
    params: unknown[],
  ) => Promise<{ rows: unknown[] }>;
}

Deno.test("OrderStatusEventRepository.createEvent inserts and returns row", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [{
          order_id: "1",
          to_status: "PAID",
          reason: "Test",
          metadata_json: {},
        }],
      }),
  };

  const repo = new OrderStatusEventRepository(fakeDB as unknown as Client);
  const result = await repo.createEvent({ order_id: "1", to_status: "PAID" });

  assertEquals(result.order_id, "1");
  assertEquals(result.to_status, "PAID");
});

Deno.test("OrderStatusEventRepository.listByOrder returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          { order_id: "1", to_status: "PAID" },
          { order_id: "1", to_status: "SHIPPED" },
        ],
      }),
  };

  const repo = new OrderStatusEventRepository(fakeDB as unknown as Client);
  const results = await repo.listByOrder("1");

  assertEquals(results.length, 2);
  assertEquals((results[0] as OrderStatusEvent).to_status, "PAID");
});
