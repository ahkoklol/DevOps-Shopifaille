// back/core/src/modules/customer-accounts/controllers/customer.controller.ts

import { Router } from "@oak/oak";
import type { AdminService } from "../services/admin.service.ts";

/** Vérifie qu'un paramètre de route est présent */
function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createAdminRouter(service: AdminService) {
  const router = new Router({ prefix: "/admins" });

  //
  // POST /customers  → créer un client
  //
  router.post("/", async (ctx) => {
    console.log("→ POST /admins triggered");

    try {
      const body = await ctx.request.body({ type: "json" }).value;
      console.log("→ received body:", body);

      const admin = await service.registerAdmin(body);
      console.log("→ service.registerAdmin returned:", admin);

      ctx.response.status = 201;
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = admin;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in POST /admins:", message);

      ctx.response.status = 400;
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /admins/:id → récupérer un client
  //
  router.get("/:id", async (ctx) => {
    console.log("→ GET handler triggered", ctx.request.url.toString());

    try {
      const id = requireParam(ctx.params.id, "id");
      console.log("→ admin id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const admin = await service.getAdminProfile(id);
      console.log("→ service.getAdminProfile returned:", admin);

      if (!admin) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Admin not found" };
        return;
      }

      ctx.response.body = admin;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET /admins/:id:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  return router;
}
