import { Router } from "@oak/oak";
import { OrderLifecycleService } from "../services/order-lifecycle.service.ts";

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createOrderLifecycleRouter(service: OrderLifecycleService) {
  const router = new Router({ prefix: "/orders/:orderId/lifecycle" });

  router.get("/", async (ctx) => {
    const orderId = requireParam(ctx.params.orderId, "orderId");
    const lifecycle = await service.getLifecycle(orderId);
    if (!lifecycle) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Lifecycle not found" };
      return;
    }
    ctx.response.body = lifecycle;
  });

  router.put("/", async (ctx) => {
    try {
      const orderId = requireParam(ctx.params.orderId, "orderId");
      const body = await ctx.request.body({ type: "json" }).value;
      const updated = await service.setStatus(orderId, body.status);
      ctx.response.body = updated;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return router;
}
