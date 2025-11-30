import { assertEquals } from "@std/assert";
import type { Client } from "postgres";
import { OrderItemRepository } from "../repositories/order-item.repository.ts";
import type { OrderItem } from "../order.type.ts";

interface FakeDB {
  queryObject: (
    query: string,
    params: unknown[],
  ) => Promise<{ rows: unknown[] }>;
}

Deno.test("OrderItemRepository.listByOrder returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            order_id: "999",
            product_id: "p1",
            variant_id: "v1",
            title_snapshot: "Test Product",
            sku_snapshot: "SKU1",
            attributes_snapshot_json: null,
            unit_price: 100,
            qty: 2,
            line_total: 200,
          },
        ],
      }),
  };

  const repo = new OrderItemRepository(fakeDB as unknown as Client);
  const result = await repo.listByOrder("999");

  assertEquals(result.length, 1);
  assertEquals((result[0] as OrderItem).title_snapshot, "Test Product");
});
