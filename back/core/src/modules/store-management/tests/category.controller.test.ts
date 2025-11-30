// category.controller.test.ts
import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createCategoryRouter } from "../controllers/category.controller.ts";
import { CategoryService } from "../services/category.service.ts";
import { Application } from "@oak/oak";
import { CreateCategoryDto } from "../store.type.ts";

function buildTestApp(router: ReturnType<typeof createCategoryRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /stores/:storeId/categories returns categories", async () => {
  const mockService = {
    listCategories: (_storeId: string) =>
      Promise.resolve([{ id: "c1", store_id: "s1", name: "Cat1", slug: "cat1", sort_order: 0 }]),
  };

  const spy = stub(mockService, "listCategories", mockService.listCategories);

  const router = createCategoryRouter(mockService as unknown as CategoryService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1/categories", { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].id, "c1");
  assertSpyCalls(spy, 1);
});

Deno.test("POST /stores/:storeId/categories creates a category", async () => {
  const mockService = {
    createCategory: (_storeId: string, dto: CreateCategoryDto) =>
      Promise.resolve({ id: "c2", store_id: "s1", ...dto }),
  };

  const spy = stub(mockService, "createCategory", mockService.createCategory);

  const router = createCategoryRouter(mockService as unknown as CategoryService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1/categories", {
    method: "POST",
    body: JSON.stringify({ name: "Cat2", slug: "cat2" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await app.handle(req);

  assertEquals(res!.status, 201);
  const body = JSON.parse(await res!.text());
  assertEquals(body.name, "Cat2");
  assertSpyCalls(spy, 1);
});

Deno.test("DELETE /stores/:storeId/categories/:id deletes category", async () => {
  const mockService = {
    deleteCategory: (_id: string) => Promise.resolve(),
  };

  const spy = stub(mockService, "deleteCategory", mockService.deleteCategory);

  const router = createCategoryRouter(mockService as unknown as CategoryService);
  const app = buildTestApp(router);

  const req = new Request("http://test/stores/s1/categories/c1", { method: "DELETE" });
  const res = await app.handle(req);

  assertEquals(res!.status, 204);
  assertSpyCalls(spy, 1);
});
