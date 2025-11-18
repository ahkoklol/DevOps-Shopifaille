import { Router } from "@oak/oak";
import { CustomerService } from "../services/customer.service.ts";

const router = new Router({ prefix: "/customers" });
const service = new CustomerService();

// ➕ Créer un client
router.post("/", async (ctx) => {
  try {
    // ✅ Nouvelle syntaxe Oak
    const body = await ctx.request.body.json();

    const customer = await service.registerCustomer(body);

    ctx.response.status = 201;
    ctx.response.body = customer;
  } catch (err) {
    // ✅ Gestion du type unknown
    const message = err instanceof Error ? err.message : String(err);
    ctx.response.status = 400;
    ctx.response.body = { error: message };
  }
});

// 🔍 Obtenir un client par ID
router.get("/:id", async (ctx) => {
  const id = ctx.params.id!;
  const customer = await service.getCustomerProfile(id);
  if (!customer) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Customer not found" };
    return;
  }
  ctx.response.body = customer;
});

export default router;
