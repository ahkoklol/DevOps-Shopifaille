// branding.service.test.ts
import { assertEquals } from "@std/assert";
import { BrandingService } from "../services/branding.service.ts";
import type { BrandingRepository } from "../repositories/branding.repository.ts";

Deno.test("BrandingService.upsertBranding calls repo.upsert", async () => {
  const fakeRepo = {
    upsert: (storeId: string, dto: Record<string, unknown>) =>
      Promise.resolve({ store_id: storeId, ...dto }),
  };

  const service = new BrandingService(
    fakeRepo as unknown as BrandingRepository,

  const result = await service.upsertBranding("s1", { theme_preset: "dark" });

  assertEquals(result.store_id, "s1");
  assertEquals(result.theme_preset, "dark");
});

Deno.test("BrandingService.getBranding returns repo result", async () => {
  const fakeRepo = {
    findByStore: (storeId: string) =>
      Promise.resolve(storeId === "s1" ? { store_id: "s1" } : null),
  };

  const service = new BrandingService(
    fakeRepo as unknown as BrandingRepository,

  const row = await service.getBranding("s1");
  assertEquals(row?.store_id, "s1");

  const empty = await service.getBranding("s2");
  assertEquals(empty, null);
});