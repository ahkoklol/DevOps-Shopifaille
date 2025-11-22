// back/core/src/modules/order-management/controllers/payment.controller.ts
import { Router } from "@oak/oak";
import { PaymentService } from "../services/payment.service.ts";

const router = new Router({ prefix: "/orders/:orderId/payments" });
const service = new PaymentService();

router.get("/", async (ctx) => {
  const { orderId } = ctx.params;
  const txs = await service.listTransactions(orderId!);
  ctx.response.body = txs;
});

router.post("/", async (ctx) => {
  try {
    const { orderId } = ctx.params;
    const body = await ctx.request.body.json();
    const tx = await service.createTransaction({
      ...body,
      order_id: orderId!,
    });
    ctx.response.status = 201;
    ctx.response.body = tx;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.response.status = 400;
    ctx.response.body = { error: message };
  }
});

export default router;
