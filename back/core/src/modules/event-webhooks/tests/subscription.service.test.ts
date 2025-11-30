import { assertEquals } from "@std/assert";
import { SubscriptionService } from "../services/subscription.service.ts";
import type { SubscriptionRepository } from "../repositories/subscription.repository.ts";

Deno.test("SubscriptionService.createSubscription converts event types and calls repo", async () => {
  const fakeRepo = {
    create: (data: Record<string, unknown>) =>
      Promise.resolve({
        id: "1",
        ...data,
      }),
  };

  const service = new SubscriptionService(
    fakeRepo as unknown as SubscriptionRepository,
  );

  const result = await service.createSubscription({
    store_id: "store_1",
    target_url: "https://test.com",
    secret: "xxx",
    event_types: ["order.created", "order.paid"],
    active: true,
  });

  assertEquals(result.event_types_csv, "order.created,order.paid");
  assertEquals(result.store_id, "store_1");
});

Deno.test("SubscriptionService.getSubscription returns repo result", async () => {
  const fakeRepo = {
    findById: (id: string) => Promise.resolve({ id }),
  };

  const service = new SubscriptionService(
    fakeRepo as unknown as SubscriptionRepository,
  );

  const result = await service.getSubscription("42");
  assertEquals(result?.id, "42");
});

Deno.test("SubscriptionService.listSubscriptionsByStore returns repo result", async () => {
  const fakeRepo = {
    listByStore: () => Promise.resolve([{ id: "1" }, { id: "2" }]),
  };

  const service = new SubscriptionService(
    fakeRepo as unknown as SubscriptionRepository,
  );

  const list = await service.listSubscriptionsByStore("store_x");

  assertEquals(list.length, 2);
});

Deno.test("SubscriptionService.activate calls repo.updateActiveStatus with true", async () => {
  const fakeRepo = {
    updateActiveStatus: (_id: string, active: boolean) =>
      Promise.resolve({ id: "88", active }),
  };

  const service = new SubscriptionService(
    fakeRepo as unknown as SubscriptionRepository,
  );

  const result = await service.activate("88");

  assertEquals(result.id, "88");
  assertEquals(result.active, true);
});

Deno.test("SubscriptionService.deactivate calls repo.updateActiveStatus with false", async () => {
  const fakeRepo = {
    updateActiveStatus: (_id: string, active: boolean) =>
      Promise.resolve({ id: "99", active }),
  };

  const service = new SubscriptionService(
    fakeRepo as unknown as SubscriptionRepository,
  );

  const result = await service.deactivate("99");

  assertEquals(result.id, "99");
  assertEquals(result.active, false);
});

Deno.test("SubscriptionService.listActiveForEvent calls repo.findActiveForEvent", async () => {
  const fakeRepo = {
    findActiveForEvent: (_store: string, _event: string) =>
      Promise.resolve([{ id: "1" }]),
  };

  const service = new SubscriptionService(
    fakeRepo as unknown as SubscriptionRepository,
  );

  const list = await service.listActiveForEvent("store_1", "order.created");

  assertEquals(list.length, 1);
  assertEquals(list[0].id, "1");
});
