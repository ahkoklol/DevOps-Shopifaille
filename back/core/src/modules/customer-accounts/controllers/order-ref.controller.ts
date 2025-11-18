import { Router } from "@oak/oak";
import { OrderRefService } from "../services/order-ref.service.ts";

const router = new Router({ prefix: "/customers/:customerId/orders" });
const service = new OrderRefService();

// 📜 Liste des commandes d’un client
router.get("/", async (ctx) => {
  const { customerId } = ctx.params;
  const orders = await service.getCustomerOrders(customerId!);
  ctx.response.body = orders;
});

export default router;
