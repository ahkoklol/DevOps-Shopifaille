// category.service.test.ts
import { assertEquals } from "@std/assert";
import { CategoryService } from "../services/category.service.ts";
import type { CategoryRepository } from "../repositories/category.repository.ts";

Deno.test("CategoryService.createCategory calls repo.create", async () => {
  const fakeRepo = {
    create: (storeId: string, dto: Record<string, unknown>) =>
      Promise.resolve({ id: "c1", store_id: storeId, ...dto }),
  };

  const service = new CategoryService(
    fakeRepo as unknown as CategoryRepository,
  );

  const result = await service.createCategory("s1", {
    name: "Cat1",
    slug: "cat1",
  });

  assertEquals(result.id, "c1");
  assertEquals(result.store_id, "s1");
});

Deno.test("CategoryService.listCategories returns repo list", async () => {
  const fakeRepo = {
    list: (_storeId: string) => Promise.resolve([{ id: "c1" }, { id: "c2" }]),
  };

  const service = new CategoryService(
    fakeRepo as unknown as CategoryRepository,
  );

  const list = await service.listCategories("s1");

  assertEquals(list.length, 2);
  assertEquals(list[0].id, "c1");
});

Deno.test("CategoryService.deleteCategory calls repo.delete", async () => {
  let deletedId = "";
  const fakeRepo = {
    delete: (id: string) => {
      deletedId = id;
      return Promise.resolve();
    },
  };

  const service = new CategoryService(
    fakeRepo as unknown as CategoryRepository,
  );

  await service.deleteCategory("c1");

  assertEquals(deletedId, "c1");
});
