import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createSubscriptionRouter } from "../controllers/subscription.controller.ts";
import { SubscriptionService } from "../services/subscription.service.ts";
import { Application } from "@oak/oak";
import { SubscribeDto, WebhookSubscription } from "../webhook.type.ts";

function buildTestApp(router: ReturnType<typeof createSubscriptionRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("POST /stores/:storeId/webhooks/subscriptions creates subscription", async () => {
  const mockService = {
    createSubscription: (data: SubscribeDto) =>
      Promise.resolve({
        id: "sub1",
        ...data,
        event_types_csv: data.event_types.join(","),
        active: true,
        created_at: new Date().toISOString(),
      }),
  };

  const spy = stub(
    mockService,
    "createSubscription",
    mockService.createSubscription,
  );

  const router = createSubscriptionRouter(
    mockService as unknown as SubscriptionService,
  );
  const app = buildTestApp(router);

  const url = "http://test/stores/store123/webhooks/subscriptions";
  const req = new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_url: "https://example.com/webhook",
      secret: "secret",
      event_types: ["order.created"],
    }),
  });

  const res = await app.handle(req);
  assertEquals(res!.status, 201);

  const body: WebhookSubscription = JSON.parse(await res!.text());
  assertEquals(body.store_id, "store123");
  assertEquals(body.event_types_csv, "order.created");
  assertSpyCalls(spy, 1);
});

Deno.test("GET /stores/:storeId/webhooks/subscriptions returns list", async () => {
  const mockService = {
    listSubscriptionsByStore: (_storeId: string) =>
      Promise.resolve([{
        id: "sub2",
        store_id: "store123",
        target_url: "https://example.com",
        secret: "secret",
        event_types_csv: "order.updated",
        active: true,
        created_at: new Date().toISOString(),
      }]),
  };

  const spy = stub(
    mockService,
    "listSubscriptionsByStore",
    mockService.listSubscriptionsByStore,
  );

  const router = createSubscriptionRouter(
    mockService as unknown as SubscriptionService,
  );
  const app = buildTestApp(router);

  const url = "http://test/stores/store123/webhooks/subscriptions";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);
  assertEquals(res!.status, 200);

  const body: WebhookSubscription[] = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].id, "sub2");
  assertSpyCalls(spy, 1);
});

Deno.test("PATCH /stores/:storeId/webhooks/subscriptions/:id/activate calls activate", async () => {
  const mockService = {
    activate: (_id: string) => Promise.resolve({ success: true }),
  };
  const spy = stub(mockService, "activate", mockService.activate);

  const router = createSubscriptionRouter(
    mockService as unknown as SubscriptionService,
  );
  const app = buildTestApp(router);

  const url =
    "http://test/stores/store123/webhooks/subscriptions/sub1/activate";
  const req = new Request(url, { method: "PATCH" });
  const res = await app.handle(req);

  const body = JSON.parse(await res!.text());
  assertEquals(body.success, true);
  assertSpyCalls(spy, 1);
});

Deno.test("PATCH /stores/:storeId/webhooks/subscriptions/:id/deactivate calls deactivate", async () => {
  const mockService = {
    deactivate: (_id: string) => Promise.resolve({ success: true }),
  };
  const spy = stub(mockService, "deactivate", mockService.deactivate);

  const router = createSubscriptionRouter(
    mockService as unknown as SubscriptionService,
  );
  const app = buildTestApp(router);

  const url =
    "http://test/stores/store123/webhooks/subscriptions/sub1/deactivate";
  const req = new Request(url, { method: "PATCH" });
  const res = await app.handle(req);

  const body = JSON.parse(await res!.text());
  assertEquals(body.success, true);
  assertSpyCalls(spy, 1);
});
