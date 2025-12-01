// branding.repository.test.ts
import { assertEquals } from "@std/assert";
import { BrandingRepository } from "../repositories/branding.repository.ts";
import type { Client } from "postgres";

interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
}

Deno.test("BrandingRepository.upsert inserts or updates and returns StoreBranding", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            store_id: "s1",
            theme_preset: "dark",
            logo_url: null,
            colors_json: null,
          },
        ],
      }),
  };

  const repo = new BrandingRepository(fakeDB as unknown as Client);
  const result = await repo.upsert("s1", { theme_preset: "dark" });

  assertEquals(result.store_id, "s1");
  assertEquals(result.theme_preset, "dark");
});

Deno.test("BrandingRepository.findByStore returns row or null", async () => {
  const fakeSuccessDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({ rows: [{ store_id: "s2", theme_preset: "light" }] }),
  };
  const repoSuccess = new BrandingRepository(
    fakeSuccessDB as unknown as Client,
  );
  const row = await repoSuccess.findByStore("s2");
  assertEquals(row?.store_id, "s2");

  const fakeEmptyDB: FakeDB = {
    queryObject: () => Promise.resolve({ rows: [] }),
  };
  const repoEmpty = new BrandingRepository(
    fakeEmptyDB as unknown as Client,
  );
  const empty = await repoEmpty.findByStore("xxx");
  assertEquals(empty, null);
});
