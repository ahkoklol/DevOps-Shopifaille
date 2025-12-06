import { Router } from "@oak/oak";
import { OrderStatusEventService } from "../services/order-status-event.service.ts";

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createOrderStatusEventRouter(service: OrderStatusEventService) {
  const router = new Router({ prefix: "/orders/:orderId/status-events" });

  router.get("/", async (ctx) => {
    const orderId = requireParam(ctx.params.orderId, "orderId");
    const events = await service.listByOrder(orderId);
    ctx.response.body = events;
  });

  return router;
}
