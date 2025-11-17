import { Router } from "@oak/oak";
import { AddressService } from "../services/address.service.ts";

const router = new Router({ prefix: "/customers/:customerId/addresses" });
const service = new AddressService();

// 📜 Liste des adresses d’un client
router.get("/", async (ctx) => {
  const { customerId } = ctx.params;
  const addresses = await service.listAddresses(customerId!);
  ctx.response.body = addresses;
});

// ➕ Ajouter une adresse
router.post("/", async (ctx) => {
  try {
    const { customerId } = ctx.params;
    const body = await ctx.request.body.json(); // ✅ modern Oak syntax
    const address = await service.addAddress({
      ...body,
      customer_id: customerId,
    });
    ctx.response.status = 201;
    ctx.response.body = address;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.response.status = 400;
    ctx.response.body = { error: message };
  }
});


export default router;