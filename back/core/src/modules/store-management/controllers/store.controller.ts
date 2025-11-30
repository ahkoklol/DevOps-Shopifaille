// store.controller.ts
import { Router } from "@oak/oak";
import type { StoreService } from "../services/store.service.ts";

/** Vérifie qu'un paramètre de route est présent */
function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createStoreRouter(service: StoreService) {
  const router = new Router({ prefix: "/stores" });

  //
  // POST /stores
  //
  router.post("/", async (ctx) => {
    console.log("→ POST /stores triggered");

    try {
      const body = await ctx.request.body({ type: "json" }).value;
      console.log("→ request body:", body);

      ctx.response.headers.set("Content-Type", "application/json");

      const store = await service.createStore(body);
      console.log("→ service.createStore returned:", store);

      ctx.response.status = 201;
      ctx.response.body = store;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in POST /stores:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /stores/:id
  //
  router.get("/:id", async (ctx) => {
    console.log("→ GET /stores/:id triggered");

    try {
      const id = requireParam(ctx.params.id, "id");
      console.log("→ id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const store = await service.getStore(id);
      console.log("→ service.getStore returned:", store);

      if (!store) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Store not found" };
        return;
      }

      ctx.response.body = store;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET /stores/:id:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /stores/owner/:ownerId
  //
  router.get("/owner/:ownerId", async (ctx) => {
    console.log("→ GET /stores/owner/:ownerId triggered");

    try {
      const ownerId = requireParam(ctx.params.ownerId, "ownerId");
      console.log("→ ownerId:", ownerId);

      ctx.response.headers.set("Content-Type", "application/json");

      const list = await service.listStoresForOwner(ownerId);
      console.log("→ service.listStoresForOwner returned:", list);

      ctx.response.body = list;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET /stores/owner/:ownerId:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  return router;
}
