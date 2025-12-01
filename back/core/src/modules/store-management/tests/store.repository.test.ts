// store.repository.test.ts
import { assertEquals } from "@std/assert";
import { StoreRepository } from "../repositories/store.repository.ts";
import type { Client } from "postgres";

interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
}

Deno.test("StoreRepository.create inserts and returns MerchantStore", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({ rows: [{ id: "st1", name: "Store1" }] }),
  };
  const repo = new StoreRepository(
    fakeDB as unknown as Client,
  );
  const result = await repo.create({
    owner_user_id: "u1",
    name: "Store1",
    subdomain: "s1",
  });
  assertEquals(result.id, "st1");
  assertEquals(result.name, "Store1");
});

Deno.test("StoreRepository.findById returns row or null", async () => {
  const fakeDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "st2" }] }),
  };
  const repo = new StoreRepository(
    fakeDB as unknown as Client,
  );
  const row = await repo.findById("st2");
  assertEquals(row?.id, "st2");

  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };
  const repoEmpty = new StoreRepository(
    fakeEmptyDB as unknown as Client,
  );
  const empty = await repoEmpty.findById("xxx");
  assertEquals(empty, null);
});

Deno.test("StoreRepository.findBySubdomain returns row or null", async () => {
  const fakeDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "st3", subdomain: "s3" }] }),
  };
  const repo = new StoreRepository(
    fakeDB as unknown as Client,
  );
  const row = await repo.findBySubdomain("s3");
  assertEquals(row?.id, "st3");

  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };
  const repoEmpty = new StoreRepository(
    fakeEmptyDB as unknown as Client,
  );
  const empty = await repoEmpty.findBySubdomain("xxx");
  assertEquals(empty, null);
});

Deno.test("StoreRepository.listByOwner returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [{ id: "st1" }, { id: "st2" }] }),
  };
  const repo = new StoreRepository(
    fakeDB as unknown as Client,
  );
  const results = await repo.listByOwner("u1");
  assertEquals(results.length, 2);
  assertEquals(results[0].id, "st1");
});
