// store.controller.test.ts
import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createStoreRouter } from "../controllers/store.controller.ts";
import { StoreService } from "../services/store.service.ts";
import { Application } from "@oak/oak";
import { CreateStoreDto } from "../store.type.ts";

function buildTestApp(router: ReturnType<typeof createStoreRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("POST /stores creates a store", async () => {
  const mockService = {
    createStore: (dto: CreateStoreDto) => Promise.resolve({ id: "s1", ...dto }),
  };

  const spy = stub(mockService, "createStore", mockService.createStore);

  const router = createStoreRouter(mockService as unknown as StoreService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores", {
    method: "POST",
    body: JSON.stringify({ owner_user_id: "u1",
      name: "Store1",
      subdomain: "store1",
    }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.handle(req);

  assertEquals(res!.status, 201);
  const body = JSON.parse(await res!.text());
  assertEquals(body.name, "Store1");
  assertSpyCalls(spy, 1);
});

Deno.test("GET /stores/:id returns a store", async () => {
  const mockService = {
    getStore: (id: string) => Promise.resolve({ id, name: "StoreX" }),
  };

  const spy = stub(mockService, "getStore", mockService.getStore);

  const router = createStoreRouter(mockService as unknown as StoreService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1", { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.id, "s1");
  assertSpyCalls(spy, 1);
});

Deno.test("GET /stores/owner/:ownerId returns list of stores", async () => {
  const mockService = {
    listStoresForOwner: (_ownerId: string) => Promise.resolve([{ id: "s1" }, { id: "s2" }]),
  };

  const spy = stub(
    mockService,
    "listStoresForOwner",
    mockService.listStoresForOwner,

  const router = createStoreRouter(mockService as unknown as StoreService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/owner/u1", { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.length, 2);
  assertSpyCalls(spy, 1);
});
