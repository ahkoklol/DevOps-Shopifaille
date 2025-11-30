// back/core/src/modules/event-webhooks/controllers/delivery.controller.ts

import { Router } from "@oak/oak";
import { DeliveryService } from "../services/delivery.service.ts";

/** Vérifie qu'un paramètre de route est présent */
function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createDeliveryRouter(service: DeliveryService) {
  const router = new Router({ prefix: "/webhooks/deliveries" });

  //
  // GET /webhooks/deliveries?subscription_id=xxx
  //
  router.get("/", async (ctx) => {
    console.log("→ GET /webhooks/deliveries triggered");

    try {
      const subId = ctx.request.url.searchParams.get("subscription_id");
      console.log("→ subscription_id:", subId);

      if (!subId) throw new Error("subscription_id query param required");

      ctx.response.headers.set("Content-Type", "application/json");

      const list = await service.listDeliveries(subId);
      console.log("→ service.listDeliveries returned:", list);

      ctx.response.body = list;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET /webhooks/deliveries:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /webhooks/deliveries/:id
  //
  router.get("/:id", async (ctx) => {
    console.log("→ GET /webhooks/deliveries/:id triggered");

    try {
      const id = requireParam(ctx.params.id, "id");
      console.log("→ id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const delivery = await service.getDelivery(id);
      console.log("→ service.getDelivery returned:", delivery);

      if (!delivery) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Delivery not found" };
        return;
      }

      ctx.response.body = delivery;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET /webhooks/deliveries/:id:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  return router;
}
