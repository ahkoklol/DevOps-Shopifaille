import { assertEquals } from "@std/assert";
import { OrderStatusEventService } from "../services/order-status-event.service.ts";
import type { OrderStatusEventRepository } from "../repositories/order-status-event.repository.ts";
import type { OrderStatus, OrderStatusEvent, UUID } from "../order.type.ts";

Deno.test("OrderStatusEventService.createEvent calls repo.createEvent", async () => {
  const fakeRepo = {
    createEvent: (data: Partial<OrderStatusEvent>) =>
      Promise.resolve({
        id: "ev1",
        occurred_at: new Date().toISOString(),
        metadata_json: null,
        ...data,
      }),
  };

  const service = new OrderStatusEventService(
    fakeRepo as unknown as OrderStatusEventRepository,
  );

  const result = await service.createEvent({
    order_id: "order_1" as UUID,
    from_status: null,
    to_status: "CREATED" as OrderStatus,
  });

  assertEquals(result.id, "ev1");
  assertEquals(result.to_status, "CREATED");
});

Deno.test("OrderStatusEventService.listByOrder returns repo result", async () => {
  const fakeRepo = {
    listByOrder: (orderId: UUID) =>
      Promise.resolve([
        {
          id: "ev1",
          order_id: orderId,
          from_status: null,
          to_status: "CREATED" as OrderStatus,
          reason: null,
          occurred_at: new Date().toISOString(),
          metadata_json: null,
        } as OrderStatusEvent,
      ]),
  };

  const service = new OrderStatusEventService(
    fakeRepo as unknown as OrderStatusEventRepository,
  );

  const list = await service.listByOrder("order_1" as UUID);

  assertEquals(list.length, 1);
  assertEquals(list[0].order_id, "order_1");
});
