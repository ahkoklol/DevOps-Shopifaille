import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createOrderLifecycleRouter } from "../controllers/order-lifecycle.controller.ts";
import { OrderLifecycleService } from "../services/order-lifecycle.service.ts";
import { Application } from "@oak/oak";
import type { OrderLifecycle, OrderStatus } from "../order.type.ts";

function buildTestApp(router: ReturnType<typeof createOrderLifecycleRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /orders/:orderId/lifecycle returns lifecycle", async () => {
  const mockService = {
    getLifecycle: (_orderId: string) =>
      Promise.resolve(
        {
          order_id: "o1",
          current_status: "CREATED",
          created_at: "",
          updated_at: "",
        } as OrderLifecycle,
      ),
  };
  const spy = stub(mockService, "getLifecycle", mockService.getLifecycle);

  const router = createOrderLifecycleRouter(
    mockService as unknown as OrderLifecycleService,
  );
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/lifecycle";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body: OrderLifecycle = JSON.parse(await res!.text());
  assertEquals(body.order_id, "o1");
  assertSpyCalls(spy, 1);
});

Deno.test("PUT /orders/:orderId/lifecycle updates status", async () => {
  const mockService = {
    setStatus: (_orderId: string, status: OrderStatus) =>
      Promise.resolve({
        order_id: "o1",
        current_status: status,
        created_at: "",
        updated_at: "",
      }),
  };
  const spy = stub(mockService, "setStatus", mockService.setStatus);

  const router = createOrderLifecycleRouter(
    mockService as unknown as OrderLifecycleService,
  );
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/lifecycle";
  const req = new Request(url, {
    method: "PUT",
    body: JSON.stringify({ status: "PAID" }),
  });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body: OrderLifecycle = JSON.parse(await res!.text());
  assertEquals(body.current_status, "PAID");
  assertSpyCalls(spy, 1);
});
