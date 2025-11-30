// back/core/src/modules/event-webhooks/controllers/subscription.controller.ts

import { Router } from "@oak/oak";
import { SubscriptionService } from "../services/subscription.service.ts";

/** Vérifie qu'un paramètre de route est présent */
function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createSubscriptionRouter(service: SubscriptionService) {
  const router = new Router({
    prefix: "/stores/:storeId/webhooks/subscriptions",
  });

  //
  // POST /stores/:storeId/webhooks/subscriptions
  //
  router.post("/", async (ctx) => {
    console.log("→ POST /subscriptions triggered");

    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      console.log("→ storeId:", storeId);

      const body = await ctx.request.body({ type: "json" }).value;
      console.log("→ received body:", body);

      const result = await service.createSubscription({
        ...body,
        store_id: storeId,
      });
      console.log("→ service.createSubscription returned:", result);

      ctx.response.status = 201;
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in POST /subscriptions:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /stores/:storeId/webhooks/subscriptions
  //
  router.get("/", async (ctx) => {
    console.log("→ GET list subscriptions triggered");

    try {
      const storeId = requireParam(ctx.params.storeId, "storeId");
      console.log("→ storeId:", storeId);

      ctx.response.headers.set("Content-Type", "application/json");

      const list = await service.listSubscriptionsByStore(storeId);
      console.log("→ service.listSubscriptionsByStore returned:", list);

      ctx.response.body = list;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET subscription list:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /stores/:storeId/webhooks/subscriptions/:id
  //
  router.get("/:id", async (ctx) => {
    console.log("→ GET subscription by id triggered");

    try {
      const id = requireParam(ctx.params.id, "id");
      const storeId = requireParam(ctx.params.storeId, "storeId");
      console.log("→ storeId:", storeId, "id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const sub = await service.getSubscription(id);
      console.log("→ service.getSubscription returned:", sub);

      if (!sub) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Subscription not found" };
        return;
      }

      ctx.response.body = sub;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET subscription by id:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // PATCH /stores/:storeId/webhooks/subscriptions/:id/activate
  //
  router.patch("/:id/activate", async (ctx) => {
    console.log("→ PATCH activate subscription triggered");

    try {
      const id = requireParam(ctx.params.id, "id");
      console.log("→ id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const r = await service.activate(id);
      console.log("→ service.activate returned:", r);

      ctx.response.body = r;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in PATCH activate:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // PATCH /stores/:storeId/webhooks/subscriptions/:id/deactivate
  //
  router.patch("/:id/deactivate", async (ctx) => {
    console.log("→ PATCH deactivate subscription triggered");

    try {
      const id = requireParam(ctx.params.id, "id");
      console.log("→ id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const r = await service.deactivate(id);
      console.log("→ service.deactivate returned:", r);

      ctx.response.body = r;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in PATCH deactivate:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  return router;
}
