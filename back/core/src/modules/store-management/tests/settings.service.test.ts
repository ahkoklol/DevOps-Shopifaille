// settings.service.test.ts
import { assertEquals } from "@std/assert";
import { SettingsService } from "../services/settings.service.ts";
import type { SettingsRepository } from "../repositories/settings.repository.ts";

Deno.test("SettingsService.upsertSettings calls repo.upsert", async () => {
  const fakeRepo = {
    upsert: (storeId: string, dto: Record<string, unknown>) =>
      Promise.resolve({ store_id: storeId, ...dto }),
  };

  const service = new SettingsService(
    fakeRepo as unknown as SettingsRepository,
  );

  const result = await service.upsertSettings("s1", { currency: "USD" });

  assertEquals(result.store_id, "s1");
  assertEquals(result.currency, "USD");
});

Deno.test("SettingsService.getSettings returns repo result", async () => {
  const fakeRepo = {
    findByStore: (storeId: string) =>
      Promise.resolve(storeId === "s1" ? { store_id: "s1" } : null),
  };

  const service = new SettingsService(
    fakeRepo as unknown as SettingsRepository,

  const row = await service.getSettings("s1");
  assertEquals(row?.store_id, "s1");

  const empty = await service.getSettings("s2");
  assertEquals(empty, null);
});
