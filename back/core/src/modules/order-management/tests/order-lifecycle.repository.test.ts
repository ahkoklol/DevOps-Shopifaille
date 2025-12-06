import { assertEquals } from "@std/assert";
import type { Client } from "postgres";
import { OrderLifecycleRepository } from "../repositories/order-lifecycle.repository.ts";

interface FakeDB {
  queryObject: (
    query: string,
    params: unknown[],
  ) => Promise<{ rows: unknown[] }>;
}

Deno.test("OrderLifecycleRepository.upsertLifecycle inserts/updates and returns OrderLifecycle", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            order_id: "123",
            current_status: "CREATED",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      }),
  };

  const repo = new OrderLifecycleRepository(fakeDB as unknown as Client);
  const result = await repo.upsertLifecycle("123", "CREATED");

  assertEquals(result.order_id, "123");
  assertEquals(result.current_status, "CREATED");
});

Deno.test("OrderLifecycleRepository.findByOrder returns row or null", async () => {
  const fakeSuccessDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ order_id: "123" }] }),
  };
  const repoSuccess = new OrderLifecycleRepository(
    fakeSuccessDB as unknown as Client,
  );
  const row = await repoSuccess.findByOrder("123");
  assertEquals(row?.order_id, "123");

  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };
  const repoEmpty = new OrderLifecycleRepository(
    fakeEmptyDB as unknown as Client,
  );
  const empty = await repoEmpty.findByOrder("xxx");
  assertEquals(empty, null);
});
