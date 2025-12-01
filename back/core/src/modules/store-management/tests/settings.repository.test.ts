// settings.repository.test.ts
import { assertEquals } from "@std/assert";
import { SettingsRepository } from "../repositories/settings.repository.ts";
import type { Client } from "postgres";

interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
}

Deno.test("SettingsRepository.upsert inserts or updates and returns StoreSettings", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [{ store_id: "s1", currency: "USD", checkout_rules_json: null }],
      }),
  };
  const repo = new SettingsRepository(
    fakeDB as unknown as Client,
  );
  const result = await repo.upsert("s1", { currency: "USD" });

  assertEquals(result.store_id, "s1");
  assertEquals(result.currency, "USD");
});

Deno.test("SettingsRepository.findByStore returns row or null", async () => {
  const fakeSuccessDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({ rows: [{ store_id: "s2", currency: "EUR" }] }),
  };
  const repoSuccess = new SettingsRepository(
    fakeSuccessDB as unknown as Client,
  );
  const row = await repoSuccess.findByStore("s2");
  assertEquals(row?.store_id, "s2");

  const fakeEmptyDB: FakeDB = { queryObject: () => Promise.resolve({ rows: [] }),
 };
  const repoEmpty = new SettingsRepository(fakeEmptyDB as unknown as Client);
  const empty = await repoEmpty.findByStore("xxx");
  assertEquals(empty, null);
});
