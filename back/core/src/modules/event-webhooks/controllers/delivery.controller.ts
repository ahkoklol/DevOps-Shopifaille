import { Router } from "@oak/oak";
import { DeliveryService } from "../services/delivery.service.ts";

const router = new Router({ prefix: "/webhooks/deliveries" });
const service = new DeliveryService();

router.get("/", async (ctx) => {
  const subId = ctx.request.url.searchParams.get("subscription_id");
  if (!subId) {
    ctx.response.status = 400;
    ctx.response.body = { error: "subscription_id query param required" };
    return;
  }

  ctx.response.body = await service.listDeliveries(subId);
});

router.get("/:id", async (ctx) => {
  const delivery = await service.getDelivery(ctx.params.id!);
  if (!delivery) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
    return;
  }
  ctx.response.body = delivery;
});

export default router;
