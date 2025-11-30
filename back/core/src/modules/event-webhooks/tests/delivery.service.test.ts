import { assertEquals } from "@std/assert";
import { DeliveryService } from "../services/delivery.service.ts";
import type { DeliveryRepository } from "../repositories/delivery.repository.ts";

Deno.test("DeliveryService.enqueueDelivery calls repo.create", async () => {
  const fakeRepo = {
    create: (data: Record<string, unknown>) =>
      Promise.resolve({
        id: "1",
        ...data,
        status: "PENDING",
        attempts: 0,
      }),
  };

  const service = new DeliveryService(
    fakeRepo as unknown as DeliveryRepository,
  );

  const result = await service.enqueueDelivery({
    subscription_id: "sub_1",
    event_type: "order.created",
    payload_json: { foo: "bar" },
  });

  assertEquals(result.subscription_id, "sub_1");
  assertEquals(result.event_type, "order.created");
  assertEquals(result.status, "PENDING");
});

Deno.test("DeliveryService.getDelivery returns repo result", async () => {
  const fakeRepo = {
    findById: (id: string) =>
      Promise.resolve(id === "10" ? { id: "10" } : null),
  };

  const service = new DeliveryService(
    fakeRepo as unknown as DeliveryRepository,
  );

  const row = await service.getDelivery("10");
  assertEquals(row?.id, "10");

  const empty = await service.getDelivery("999");
  assertEquals(empty, null);
});

Deno.test("DeliveryService.listDeliveries returns repo list", async () => {
  const fakeRepo = {
    listBySubscription: () => Promise.resolve([{ id: "a" }, { id: "b" }]),
  };

  const service = new DeliveryService(
    fakeRepo as unknown as DeliveryRepository,
  );

  const list = await service.listDeliveries("sub_x");

  assertEquals(list.length, 2);
  assertEquals(list[0].id, "a");
});

Deno.test("DeliveryService.updateStatus calls repo.updateStatus", async () => {
  const fakeRepo = {
    updateStatus: (id: string, status: string, attempts: number) =>
      Promise.resolve({
        id,
        status,
        attempts,
      }),
  };

  const service = new DeliveryService(
    fakeRepo as unknown as DeliveryRepository,
  );

  const result = await service.updateStatus("55", "FAILED", 3);

  assertEquals(result.id, "55");
  assertEquals(result.status, "FAILED");
  assertEquals(result.attempts, 3);
});
