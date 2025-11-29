// back/core/src/modules/customer-accounts/controllers/address.controller.ts

import { Router } from "@oak/oak";
import { AddressService } from "../services/address.service.ts";

function requireParam<T extends string>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createAddressRouter(service: AddressService) {
  const router = new Router({ prefix: "/customers" });

  // GET /customers/:customerId/addresses
  router.get("/:customerId/addresses", async (ctx) => {
    console.log("→ GET handler triggered", ctx.request.url.toString());
    const customerId = requireParam(ctx.params.customerId, "customerId");
    console.log("→ customerId:", customerId);

    ctx.response.headers.set("Content-Type", "application/json");

    const result = await service.listAddresses(customerId);
    console.log("→ service.listAddresses returned:", result);

    ctx.response.body = result;
  });

  // POST /customers/:customerId/addresses
  router.post("/:customerId/addresses", async (ctx) => {
    console.log("→ POST handler triggered");
    const body = await ctx.request.body({ type: "json" }).value;
    console.log("→ received body:", body);

    const customerId = requireParam(ctx.params.customerId, "customerId");
    console.log("→ customerId:", customerId);

    const address = await service.addAddress({
      ...body,
      customer_id: customerId,
    });

    console.log("→ service.addAddress returned:", address);

    ctx.response.status = 201;
    ctx.response.body = address;
  });

  router.put("/:customerId/addresses/:addressId/default", async (ctx) => {
    const customerId = requireParam(ctx.params.customerId, "customerId");
    const addressId = requireParam(ctx.params.addressId, "addressId");

    await service.setDefault(customerId, addressId);
    ctx.response.status = 204;
  });

  router.delete("/:customerId/addresses/:addressId", async (ctx) => {
    const addressId = requireParam(ctx.params.addressId, "addressId");
    await service.removeAddress(addressId);
    ctx.response.status = 204;
  });

  return router;
}
