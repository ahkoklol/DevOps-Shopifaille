import { Router } from "@oak/oak";
import { SettingsService } from "../services/settings.service.ts";

const router = new Router({ prefix: "/stores/:storeId/settings" });
const service = new SettingsService();

router.get("/", async (ctx) => {
  ctx.response.body = await service.getSettings(ctx.params.storeId!);
});

router.put("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const settings = await service.upsertSettings(ctx.params.storeId!, body);
    ctx.response.body = settings;
  } catch (err) {
    ctx.response.status = 400;
    ctx.response.body = { error: String(err) };
  }
});

export default router;
