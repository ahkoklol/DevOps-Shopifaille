import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createPaymentRouter } from "../controllers/payment.controller.ts";
import { PaymentService } from "../services/payment.service.ts";
import { Application } from "@oak/oak";
import type { PaymentTransaction, TxStatus } from "../order.type.ts";

function buildTestApp(router: ReturnType<typeof createPaymentRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /orders/:orderId/payments returns transactions", async () => {
  const mockService = {
    listTransactions: (_orderId: string) =>
      Promise.resolve(
        [{
          id: "tx1",
          order_id: "o1",
          provider: "stripe",
          amount: 100,
          status: "PENDING",
          created_at: new Date().toISOString(),
        }] as PaymentTransaction[],
      ),
  };
  const spy = stub(
    mockService,
    "listTransactions",
    mockService.listTransactions,
  );

  const router = createPaymentRouter(mockService as unknown as PaymentService);
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/payments";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body: PaymentTransaction[] = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].id, "tx1");
  assertSpyCalls(spy, 1);
});

Deno.test("POST /orders/:orderId/payments creates transaction", async () => {
  type TxInput = {
    provider: string;
    reference?: string | null;
    amount: number;
    status?: TxStatus;
  };
  const mockService = {
    createTransaction: (data: TxInput & { order_id: string }) =>
      Promise.resolve(
        {
          id: "tx1",
          ...data,
          created_at: new Date().toISOString(),
        } as PaymentTransaction,
      ),
  };
  const spy = stub(
    mockService,
    "createTransaction",
    mockService.createTransaction,
  );

  const router = createPaymentRouter(mockService as unknown as PaymentService);
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/payments";
  const req = new Request(url, {
    method: "POST",
    body: JSON.stringify({ provider: "stripe", amount: 100 }),
  });
  const res = await app.handle(req);

  assertEquals(res!.status, 201);
  const body: PaymentTransaction = JSON.parse(await res!.text());
  assertEquals(body.id, "tx1");
  assertEquals(body.order_id, "o1");
  assertSpyCalls(spy, 1);
});
