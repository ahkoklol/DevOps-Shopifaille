import { assertEquals } from "@std/assert";
import { SubscriptionRepository } from "../repositories/subscription.repository.ts";
import type { Client } from "postgres";

// Fake DB minimal
interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
}

Deno.test("SubscriptionRepository.create inserts and returns subscription", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            store_id: "store_9",
            target_url: "https://callback.test",
            secret: "abc",
            event_types_csv: "order.created",
            active: true,
          },
        ],
      }),
  };

  const repo = new SubscriptionRepository(fakeDB as unknown as Client);

  const result = await repo.create({
    store_id: "store_9",
    target_url: "https://callback.test",
    secret: "abc",
    event_types_csv: "order.created",
    active: true,
  });

  assertEquals(result.target_url, "https://callback.test");
  assertEquals(result.active, true);
});

Deno.test("SubscriptionRepository.findById returns row or null", async () => {
  const fakeSuccessDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [{ id: "55", store_id: "store_1" }],
      }),
  };

  const repoSuccess = new SubscriptionRepository(
    fakeSuccessDB as unknown as Client,
  );
  const result = await repoSuccess.findById("55");

  assertEquals(result?.id, "55");

  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };

  const repoEmpty = new SubscriptionRepository(
    fakeEmptyDB as unknown as Client,
  );
  const emptyResult = await repoEmpty.findById("nope");

  assertEquals(emptyResult, null);
});

Deno.test("SubscriptionRepository.listByStore returns subscriptions", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          { id: "1", store_id: "store_x" },
          { id: "2", store_id: "store_x" },
        ],
      }),
  };

  const repo = new SubscriptionRepository(fakeDB as unknown as Client);

  const results = await repo.listByStore("store_x");

  assertEquals(results.length, 2);
});

Deno.test("SubscriptionRepository.updateActiveStatus updates and returns subscription", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "99",
            active: false,
          },
        ],
      }),
  };

  const repo = new SubscriptionRepository(fakeDB as unknown as Client);

  const result = await repo.updateActiveStatus("99", false);

  assertEquals(result.id, "99");
  assertEquals(result.active, false);
});

Deno.test("SubscriptionRepository.findActiveForEvent filters correctly", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            store_id: "store_1",
            active: true,
            event_types_csv: "order.created,order.paid",
          },
        ],
      }),
  };

  const repo = new SubscriptionRepository(fakeDB as unknown as Client);

  const results = await repo.findActiveForEvent("store_1", "order.created");

  assertEquals(results.length, 1);
  assertEquals(results[0].id, "1");
});
