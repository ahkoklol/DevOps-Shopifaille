// category.repository.test.ts
import { assertEquals } from "@std/assert";
import { CategoryRepository } from "../repositories/category.repository.ts";
import type { Client } from "postgres";

interface FakeDB {
  queryObject: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
}

Deno.test("CategoryRepository.create inserts and returns StoreCategory", async () => {
  const fakeDB: FakeDB = {
    queryObject: (_sql, _params) =>
      Promise.resolve({ rows: [{ id: "c1", store_id: "s1", name: "Cat1", slug: "cat1", sort_order: 0 }] }),
  };
  const repo = new CategoryRepository(fakeDB as unknown as Client);
  const result = await repo.create("s1", { name: "Cat1", slug: "cat1" });

  assertEquals(result.id, "c1");
  assertEquals(result.name, "Cat1");
});

Deno.test("CategoryRepository.list returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "c1" }, { id: "c2" }] }),
  };
  const repo = new CategoryRepository(fakeDB as unknown as Client);
  const results = await repo.list("s1");

  assertEquals(results.length, 2);
  assertEquals(results[0].id, "c1");
});

Deno.test("CategoryRepository.delete calls queryObject", async () => {
  let calledId = "";
  const fakeDB: FakeDB = {
    queryObject: (_sql, params) => {
      calledId = params![0] as string;
      return Promise.resolve({ rows: [] }); // <-- retourne une Promise sans async
    },
  };
  const repo = new CategoryRepository(fakeDB as unknown as Client);
  await repo.delete("c1");

  assertEquals(calledId, "c1");
});
