import { Router } from "@oak/oak";
import { OrderItemService } from "../services/order-item.service.ts";

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createOrderItemRouter(service: OrderItemService) {
  const router = new Router({ prefix: "/orders/:orderId/items" });

  router.get("/", async (ctx) => {
    const orderId = requireParam(ctx.params.orderId, "orderId");
    const items = await service.listItems(orderId);
    ctx.response.body = items;
  });

  router.post("/", async (ctx) => {
    try {
      const orderId = requireParam(ctx.params.orderId, "orderId");
      const body = await ctx.request.body({ type: "json" }).value;
      const items = await service.createItems(orderId, body);
      ctx.response.status = 201;
      ctx.response.body = items;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return router;
}
