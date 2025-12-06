import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createDeliveryRouter } from "../controllers/delivery.controller.ts";
import { DeliveryService } from "../services/delivery.service.ts";
import { Application } from "@oak/oak";
import { WebhookDelivery } from "../webhook.type.ts";

function buildTestApp(router: ReturnType<typeof createDeliveryRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /webhooks/deliveries?subscription_id=xxx returns list", async () => {
  const mockService = {
    listDeliveries: (_subId: string) =>
      Promise.resolve([
        {
          id: "d1",
          subscription_id: "s1",
          event_type: "order.created",
          payload_json: {},
          status: "PENDING",
          attempts: 0,
        },
      ]),
  };

  const spy = stub(mockService, "listDeliveries", mockService.listDeliveries);

  const router = createDeliveryRouter(
    mockService as unknown as DeliveryService,
  );
  const app = buildTestApp(router);

  const url = "http://test/webhooks/deliveries?subscription_id=s1";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);

  const body: WebhookDelivery[] = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].id, "d1");
  assertSpyCalls(spy, 1);
});

Deno.test("GET /webhooks/deliveries/:id returns a single delivery", async () => {
  const mockService = {
    getDelivery: (_id: string) =>
      Promise.resolve({
        id: "d2",
        subscription_id: "s2",
        event_type: "order.updated",
        payload_json: {},
        status: "SENT",
        attempts: 1,
      }),
  };

  const spy = stub(mockService, "getDelivery", mockService.getDelivery);

  const router = createDeliveryRouter(
    mockService as unknown as DeliveryService,
  );
  const app = buildTestApp(router);

  const url = "http://test/webhooks/deliveries/d2";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);

  const body: WebhookDelivery = JSON.parse(await res!.text());
  assertEquals(body.id, "d2");
  assertSpyCalls(spy, 1);
});
