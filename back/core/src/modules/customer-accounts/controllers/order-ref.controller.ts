// back/core/src/modules/customer-accounts/controllers/order-ref.controller.ts

import { Router } from "@oak/oak";
import type { OrderRefService } from "../services/order-ref.service.ts";

function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createOrderRefRouter(service: OrderRefService) {
  const router = new Router({ prefix: "/customers" });

  // --------------------------------------------------------
  // GET /customers/:customerId/orders
  // --------------------------------------------------------
  router.get("/:customerId/orders", async (ctx) => {
    console.log("→ GET orders handler triggered:", ctx.request.url.toString());

    const customerId = requireParam(ctx.params.customerId, "customerId");
    console.log("→ customerId:", customerId);

    ctx.response.headers.set("Content-Type", "application/json");

    const orders = await service.getCustomerOrders(customerId);
    console.log("→ service.getCustomerOrders returned:", orders);

    ctx.response.body = orders; // type: CustomerOrderRef[]
  });

  return router;
}
