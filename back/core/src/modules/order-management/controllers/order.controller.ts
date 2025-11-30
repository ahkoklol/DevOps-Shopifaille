import { Router } from "@oak/oak";
import { OrderService } from "../services/order.service.ts";

export function createOrderRouter(service: OrderService) {
  const router = new Router({ prefix: "/orders" });

  router.post("/", async (ctx) => {
    try {
      const body = await ctx.request.body({ type: "json" }).value;
      const result = await service.createOrder(body);
      ctx.response.status = 201;
      ctx.response.body = result;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  router.get("/:id", async (ctx) => {
    const { id } = ctx.params;
    const order = await service.getOrder(id!);
    if (!order) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Order not found" };
      return;
    }
    ctx.response.body = order;
  });

  router.get("/customer/:customerId", async (ctx) => {
    const { customerId } = ctx.params;
    const orders = await service.listOrdersForCustomer(customerId!);
    ctx.response.body = orders;
  });

  router.post("/:id/status", async (ctx) => {
    try {
      const { id } = ctx.params;
      const body = await ctx.request.body({ type: "json" }).value;
      const updated = await service.updateStatus(id!, body.status, {
        reason: body.reason,
        metadata: body.metadata,
      });
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
