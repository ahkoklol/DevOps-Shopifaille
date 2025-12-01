// branding.controller.test.ts
import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createBrandingRouter } from "../controllers/branding.controller.ts";
import { BrandingService } from "../services/branding.service.ts";
import { Application } from "@oak/oak";
import { UpsertBrandingDto } from "../store.type.ts";

function buildTestApp(router: ReturnType<typeof createBrandingRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /stores/:storeId/branding returns branding", async () => {
  const mockService = {
    getBranding: (_storeId: string) =>
      Promise.resolve({
        store_id: "s1",
        theme_preset: "dark",
        logo_url: null,
        colors_json: {},
      }),
  };

  const spy = stub(mockService, "getBranding", mockService.getBranding);

  const router = createBrandingRouter(
    mockService as unknown as BrandingService,
  );
  const app = buildTestApp(router);
  

  const req = new Request("http://test/stores/s1/branding", { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.store_id, "s1");
  assertSpyCalls(spy, 1);
});

Deno.test("PUT /stores/:storeId/branding updates branding", async () => {
  const mockService = {
    upsertBranding: (_storeId: string, dto: UpsertBrandingDto) =>
      Promise.resolve({ store_id: "s1", ...dto }),
  };

  const spy = stub(mockService, "upsertBranding", mockService.upsertBranding);

  const router = createBrandingRouter(
    mockService as unknown as BrandingService,
  );
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1/branding", {
    method: "PUT",
    body: JSON.stringify({ theme_preset: "light" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.theme_preset, "light");
  assertSpyCalls(spy, 1);
});
