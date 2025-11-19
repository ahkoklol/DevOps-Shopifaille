// back/core/src/modules/order-management/controllers/order-status-event.controller.ts
import { Router } from "@oak/oak";
import { OrderStatusEventService } from "../services/order-status-event.service.ts";

const router = new Router({ prefix: "/orders/:orderId/status-events" });
const service = new OrderStatusEventService();

router.get("/", async (ctx) => {
  const { orderId } = ctx.params;
  const events = await service.listEvents(orderId!);
  ctx.response.body = events;
});

export default router;
