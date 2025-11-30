import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createOrderStatusEventRouter } from "../controllers/order-status-event.controller.ts";
import { OrderStatusEventService } from "../services/order-status-event.service.ts";
import { Application } from "@oak/oak";
import type { OrderStatusEvent } from "../order.type.ts";

function buildTestApp(router: ReturnType<typeof createOrderStatusEventRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /orders/:orderId/status-events returns list", async () => {
  const mockService = {
    listByOrder: (_orderId: string) =>
      Promise.resolve([{ id: "ev1", order_id: "o1" }] as OrderStatusEvent[]),
  };
  const spy = stub(mockService, "listByOrder", mockService.listByOrder);

  const router = createOrderStatusEventRouter(
    mockService as unknown as OrderStatusEventService,
  );
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/status-events";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body: OrderStatusEvent[] = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].id, "ev1");
  assertSpyCalls(spy, 1);
});
