import { assertEquals } from "@std/assert";
import { OrderLifecycleService } from "../services/order-lifecycle.service.ts";
import type { OrderLifecycleRepository } from "../repositories/order-lifecycle.repository.ts";
import type { OrderStatus, UUID } from "../order.type.ts";

Deno.test("OrderLifecycleService.getLifecycle returns repo result", async () => {
  const fakeRepo = {
    findByOrder: (orderId: UUID) =>
      Promise.resolve({
        order_id: orderId,
        current_status: "CREATED" as OrderStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
  };

  const service = new OrderLifecycleService(
    fakeRepo as unknown as OrderLifecycleRepository,
  );

  const lifecycle = await service.getLifecycle("order_1" as UUID);

  assertEquals(lifecycle?.order_id, "order_1");
  assertEquals(lifecycle?.current_status, "CREATED");
});

Deno.test("OrderLifecycleService.setStatus calls repo.upsertLifecycle", async () => {
  const fakeRepo = {
    upsertLifecycle: (orderId: UUID, status: OrderStatus) =>
      Promise.resolve({
        order_id: orderId,
        current_status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
  };

  const service = new OrderLifecycleService(
    fakeRepo as unknown as OrderLifecycleRepository,
  );

  const updated = await service.setStatus("order_1" as UUID, "PAID");

  assertEquals(updated.order_id, "order_1");
  assertEquals(updated.current_status, "PAID");
});
