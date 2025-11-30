import { assertEquals } from "@std/assert";
import { PaymentService } from "../services/payment.service.ts";
import type { PaymentRepository } from "../repositories/payment.repository.ts";
import type { PaymentTransaction, TxStatus, UUID } from "../order.type.ts";

Deno.test("PaymentService.createTransaction calls repo.createTx", async () => {
  const fakeRepo = {
    createTx: (data: Partial<PaymentTransaction>) =>
      Promise.resolve({ id: "tx1", ...data } as PaymentTransaction),
  };

  const service = new PaymentService(fakeRepo as unknown as PaymentRepository);

  const tx = await service.createTransaction({
    order_id: "o1" as UUID,
    provider: "stripe",
    amount: 100,
    status: "PENDING" as TxStatus,
  });

  assertEquals(tx.id, "tx1");
  assertEquals(tx.order_id, "o1");
  assertEquals(tx.status, "PENDING");
});

Deno.test("PaymentService.listTransactions returns repo result", async () => {
  const fakeRepo = {
    listByOrder: (_: UUID) =>
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

  const service = new PaymentService(fakeRepo as unknown as PaymentRepository);

  const list = await service.listTransactions("o1" as UUID);

  assertEquals(list.length, 1);
  assertEquals(list[0].id, "tx1");
});
