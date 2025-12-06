// settings.controller.ts
import { Router } from "@oak/oak";
import type { SettingsService } from "../services/settings.service.ts";

function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createSettingsRouter(service: SettingsService) {
  const router = new Router({ prefix: "/stores/:storeId/settings" });

  router.get("/", async (ctx) => {
    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      const settings = await service.getSettings(storeId);
      ctx.response.body = settings;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  router.put("/", async (ctx) => {
    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      const body = await ctx.request.body({ type: "json" }).value;
      const settings = await service.upsertSettings(storeId, body);
      ctx.response.body = settings;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return router;
}
