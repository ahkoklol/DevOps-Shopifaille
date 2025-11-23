// back/core/src/modules/customer-accounts/controllers/customer.controller.ts

import { Router } from "@oak/oak";
import type { CustomerService } from "../services/customer.service.ts";

/** Vérifie qu'un paramètre de route est présent */
function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createCustomerRouter(service: CustomerService) {
  const router = new Router({ prefix: "/customers" });

  //
  // POST /customers  → créer un client
  //
  router.post("/", async (ctx) => {
    console.log("→ POST /customers triggered");

    try {
      const body = await ctx.request.body({ type: "json" }).value;
      console.log("→ received body:", body);

      const customer = await service.registerCustomer(body);
      console.log("→ service.registerCustomer returned:", customer);

      ctx.response.status = 201;
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = customer;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in POST /customers:", message);

      ctx.response.status = 400;
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = { error: message };
    }
  });

  //
  // GET /customers/:id → récupérer un client
  //
  router.get("/:id", async (ctx) => {
    console.log("→ GET handler triggered", ctx.request.url.toString());

    try {
      const id = requireParam(ctx.params.id, "id");
      console.log("→ customer id:", id);

      ctx.response.headers.set("Content-Type", "application/json");

      const customer = await service.getCustomerProfile(id);
      console.log("→ service.getCustomerProfile returned:", customer);

      if (!customer) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Customer not found" };
        return;
      }

      ctx.response.body = customer;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("→ ERROR in GET /customers/:id:", message);

      ctx.response.status = 400;
      ctx.response.body = { error: message };
    }
  });

  return router;
}
