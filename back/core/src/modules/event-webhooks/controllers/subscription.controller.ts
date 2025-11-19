import { Router } from "@oak/oak";
import { SubscriptionService } from "../services/subscription.service.ts";

const router = new Router({
  prefix: "/stores/:storeId/webhooks/subscriptions",
});
const service = new SubscriptionService();

router.post("/", async (ctx) => {
  try {
    const { storeId } = ctx.params;
    const body = await ctx.request.body.json();

    const result = await service.createSubscription({
      ...body,
      store_id: storeId!,
    });

    ctx.response.status = 201;
    ctx.response.body = result;
  } catch (err) {
    ctx.response.status = 400;
    ctx.response.body = { error: String(err) };
  }
});

router.get("/", async (ctx) => {
  const { storeId } = ctx.params;
  ctx.response.body = await service.listSubscriptionsByStore(storeId!);
});

router.get("/:id", async (ctx) => {
  const sub = await service.getSubscription(ctx.params.id!);
  if (!sub) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
    return;
  }
  ctx.response.body = sub;
});

router.patch("/:id/activate", async (ctx) => {
  ctx.response.body = await service.activate(ctx.params.id!);
});

router.patch("/:id/deactivate", async (ctx) => {
  ctx.response.body = await service.deactivate(ctx.params.id!);
});

export default router;
