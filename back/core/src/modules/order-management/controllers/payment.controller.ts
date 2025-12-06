import { Router } from "@oak/oak";
import { PaymentService } from "../services/payment.service.ts";

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

export function createPaymentRouter(service: PaymentService) {
  const router = new Router({ prefix: "/orders/:orderId/payments" });

  router.get("/", async (ctx) => {
    const orderId = requireParam(ctx.params.orderId, "orderId");
    const txs = await service.listTransactions(orderId);
    ctx.response.body = txs;
  });

  router.post("/", async (ctx) => {
    try {
      const orderId = requireParam(ctx.params.orderId, "orderId");
      const body = await ctx.request.body({ type: "json" }).value;
      const tx = await service.createTransaction({
        ...body,
        order_id: orderId,
      });
      ctx.response.status = 201;
      ctx.response.body = tx;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  return router;
}
