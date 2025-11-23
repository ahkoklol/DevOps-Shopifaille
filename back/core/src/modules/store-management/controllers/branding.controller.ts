import { Router } from "@oak/oak";
import { BrandingService } from "../services/branding.service.ts";

const router = new Router({ prefix: "/stores/:storeId/branding" });
const service = new BrandingService();

router.get("/", async (ctx) => {
  const branding = await service.getBranding(ctx.params.storeId!);
  ctx.response.body = branding;
});

router.put("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const branding = await service.upsertBranding(ctx.params.storeId!, body);
    ctx.response.body = branding;
  } catch (err) {
    ctx.response.status = 400;
    ctx.response.body = { error: String(err) };
  }
});

export default router;
