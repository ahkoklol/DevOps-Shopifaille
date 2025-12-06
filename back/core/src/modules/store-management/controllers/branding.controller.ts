// branding.controller.ts
import { Router } from "@oak/oak";
import type { BrandingService } from "../services/branding.service.ts";

function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createBrandingRouter(service: BrandingService) {
  const router = new Router({ prefix: "/stores/:storeId/branding" });

  router.get("/", async (ctx) => {
    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      const branding = await service.getBranding(storeId);
      ctx.response.body = branding;
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
      const branding = await service.upsertBranding(storeId, body);
      ctx.response.body = branding;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return router;
}
