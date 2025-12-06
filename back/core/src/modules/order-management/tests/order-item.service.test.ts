import { assertEquals } from "@std/assert";
import { OrderItemService } from "../services/order-item.service.ts";
import type { OrderItemRepository } from "../repositories/order-item.repository.ts";
import type { OrderItem, UUID } from "../order.type.ts";

Deno.test("OrderItemService.listItems calls repo.listByOrder", async () => {
  const fakeRepo = {
    listByOrder: (orderId: UUID) =>
      Promise.resolve([
        {
          id: "i1",
          order_id: orderId,
          product_id: "p1",
          variant_id: "v1",
          title_snapshot: "Item1",
          sku_snapshot: "SKU1",
          attributes_snapshot_json: null,
          unit_price: 100,
          qty: 2,
          line_total: 200,
        } as OrderItem,
      ]),
  };

  const service = new OrderItemService(
    fakeRepo as unknown as OrderItemRepository,
  );

  const items = await service.listItems("order_123" as UUID);

  assertEquals(items.length, 1);
  assertEquals(items[0].order_id, "order_123");
  assertEquals(items[0].title_snapshot, "Item1");
});

Deno.test("OrderItemService.createItems calls repo.createItemsForOrder", async () => {
  const fakeRepo = {
    createItemsForOrder: (orderId: UUID, items: OrderItem[]) =>
      Promise.resolve(
        items.map((item, idx) => ({
          ...item,
          id: `i${idx + 1}`,
          order_id: orderId,
        })) as OrderItem[],
      ),
  };

  const service = new OrderItemService(
    fakeRepo as unknown as OrderItemRepository,
  );

  const data = [
    {
      product_id: "p1" as UUID,
      variant_id: "v1" as UUID,
      qty: 2,
      unit_price: 100,
      title: "Test",
      sku: "SKU1",
    },
  ];

  const result = await service.createItems("order_999" as UUID, data);

  assertEquals(result.length, 1);
  assertEquals(result[0].order_id, "order_999");
  assertEquals(result[0].title_snapshot, undefined); // car dans OrderItemService, le repo génère title_snapshot
});
