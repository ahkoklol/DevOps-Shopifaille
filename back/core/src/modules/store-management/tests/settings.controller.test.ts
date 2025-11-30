// settings.controller.test.ts
import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createSettingsRouter } from "../controllers/settings.controller.ts";
import { SettingsService } from "../services/settings.service.ts";
import { Application } from "@oak/oak";
import { UpsertSettingsDto } from "../store.type.ts";

function buildTestApp(router: ReturnType<typeof createSettingsRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /stores/:storeId/settings returns settings", async () => {
  const mockService = {
    getSettings: (_storeId: string) =>
      Promise.resolve({ store_id: "s1", currency: "USD", checkout_rules_json: {} }),
  };

  const spy = stub(mockService, "getSettings", mockService.getSettings);

  const router = createSettingsRouter(mockService as unknown as SettingsService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1/settings", { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.store_id, "s1");
  assertSpyCalls(spy, 1);
});

Deno.test("PUT /stores/:storeId/settings updates settings", async () => {
  const mockService = {
    upsertSettings: (_storeId: string, dto: UpsertSettingsDto) => Promise.resolve({ store_id: "s1", ...dto }),
  };

  const spy = stub(mockService, "upsertSettings", mockService.upsertSettings);

  const router = createSettingsRouter(mockService as unknown as SettingsService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1/settings", {
    method: "PUT",
    body: JSON.stringify({ currency: "EUR" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.currency, "EUR");
  assertSpyCalls(spy, 1);
});
