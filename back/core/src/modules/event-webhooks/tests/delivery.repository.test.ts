import { assertEquals } from "@std/assert";
import { DeliveryRepository } from "../repositories/delivery.repository.ts";
import type { Client } from "postgres";

// Fake DB minimal
interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
}

Deno.test("DeliveryRepository.create inserts and returns WebhookDelivery", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            subscription_id: "sub_123",
            event_type: "order.created",
            payload_json: { foo: "bar" },
            status: "PENDING",
            attempts: 0,
          },
        ],
      }),
  };

  const repo = new DeliveryRepository(fakeDB as unknown as Client);

  const result = await repo.create({
    subscription_id: "sub_123",
    event_type: "order.created",
    payload_json: { foo: "bar" },
  });

  assertEquals(result.subscription_id, "sub_123");
  assertEquals(result.status, "PENDING");
});

Deno.test("DeliveryRepository.updateStatus updates record and returns it", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "10",
            subscription_id: "sub_123",
            event_type: "order.created",
            payload_json: {},
            status: "FAILED",
            attempts: 3,
          },
        ],
      }),
  };

  const repo = new DeliveryRepository(fakeDB as unknown as Client);

  const result = await repo.updateStatus("10", "FAILED", 3);

  assertEquals(result.id, "10");
  assertEquals(result.status, "FAILED");
  assertEquals(result.attempts, 3);
});

Deno.test("DeliveryRepository.findById returns row or null", async () => {
  // ---- Test success ----
  const fakeSuccessDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [{ id: "77", subscription_id: "abc" }],
      }),
  };

  const repoSuccess = new DeliveryRepository(
    fakeSuccessDB as unknown as Client,
  );
  const row = await repoSuccess.findById("77");
  assertEquals(row?.id, "77");

  // ---- Test empty result ----
  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };

  const repoEmpty = new DeliveryRepository(fakeEmptyDB as unknown as Client);
  const empty = await repoEmpty.findById("xxx");
  assertEquals(empty, null);
});

Deno.test("DeliveryRepository.listBySubscription returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          { id: "1", subscription_id: "sub_1" },
          { id: "2", subscription_id: "sub_1" },
        ],
      }),
  };

  const repo = new DeliveryRepository(fakeDB as unknown as Client);

  const results = await repo.listBySubscription("sub_1");

  assertEquals(results.length, 2);
  assertEquals(results[0].id, "1");
});
