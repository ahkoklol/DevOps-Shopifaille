// back/core/src/modules/order-management/controllers/order-lifecycle.controller.ts
import { Router } from "@oak/oak";
import { OrderLifecycleService } from "../services/order-lifecycle.service.ts";

const router = new Router({ prefix: "/orders/:orderId/lifecycle" });
const service = new OrderLifecycleService();

router.get("/", async (ctx) => {
  const { orderId } = ctx.params;
  const lifecycle = await service.getLifecycle(orderId!);
  if (!lifecycle) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Lifecycle not found" };
    return;
  }
  ctx.response.body = lifecycle;
});

export default router;
