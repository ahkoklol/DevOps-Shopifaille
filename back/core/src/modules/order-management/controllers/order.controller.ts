// back/core/src/modules/order-management/controllers/order.controller.ts
import { Router } from "@oak/oak";
import { OrderService } from "../services/order.service.ts";

const router = new Router({ prefix: "/orders" });
const service = new OrderService();

router.post("/", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const result = await service.createOrder(body);
    ctx.response.status = 201;
    ctx.response.body = result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.response.status = 400;
    ctx.response.body = { error: message };
  }
});

router.get("/:id", async (ctx) => {
  const order = await service.getOrder(ctx.params.id!);
  if (!order) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Order not found" };
    return;
  }
  ctx.response.body = order;
});

router.get("/customer/:customerId", async (ctx) => {
  const orders = await service.listOrdersForCustomer(ctx.params.customerId!);
  ctx.response.body = orders;
});

router.post("/:id/status", async (ctx) => {
  try {
    const { id } = ctx.params;
    const body = await ctx.request.body.json();
    const updated = await service.updateStatus(id!, body.status, {
      reason: body.reason,
      metadata: body.metadata,
    });
    ctx.response.body = updated;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.response.status = 400;
    ctx.response.body = { error: message };
  }
});

export default router;
