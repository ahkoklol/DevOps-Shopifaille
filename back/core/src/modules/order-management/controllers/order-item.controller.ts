// back/core/src/modules/order-management/controllers/order-item.controller.ts
import { Router } from "@oak/oak";
import { OrderItemService } from "../services/order-item.service.ts";

const router = new Router({ prefix: "/orders/:orderId/items" });
const service = new OrderItemService();

router.get("/", async (ctx) => {
  const { orderId } = ctx.params;
  const items = await service.listItems(orderId!);
  ctx.response.body = items;
});

export default router;
