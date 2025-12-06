import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createOrderItemRouter } from "../controllers/order-item.controller.ts";
import { OrderItemService } from "../services/order-item.service.ts";
import { Application } from "@oak/oak";
import type { OrderItem } from "../order.type.ts";

function buildTestApp(router: ReturnType<typeof createOrderItemRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("GET /orders/:orderId/items returns list", async () => {
  const mockService = {
    listItems: (_orderId: string) =>
      Promise.resolve([
        { id: "i1", order_id: "o1", product_id: "p1" } as OrderItem,
      ]),
  };
  const spy = stub(mockService, "listItems", mockService.listItems);

  const router = createOrderItemRouter(
    mockService as unknown as OrderItemService,
  );
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/items";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body: OrderItem[] = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].id, "i1");
  assertSpyCalls(spy, 1);
});

Deno.test("POST /orders/:orderId/items creates items", async () => {
  const mockService = {
    createItems: (_orderId: string, items: OrderItem[]) =>
      Promise.resolve(
        items.map((i, idx) => ({ ...i, id: `i${idx + 1}`, order_id: "o1" })),
      ),
  };
  const spy = stub(mockService, "createItems", mockService.createItems);

  const router = createOrderItemRouter(
    mockService as unknown as OrderItemService,
  );
  const app = buildTestApp(router);

  const url = "http://test/orders/o1/items";
  const req = new Request(url, {
    method: "POST",
    body: JSON.stringify([{
      product_id: "p1",
      variant_id: "v1",
      qty: 1,
      unit_price: 10,
      title: "Item1",
      sku: "SKU1",
    }]),
  });
  const res = await app.handle(req);

  assertEquals(res!.status, 201);
  const body: OrderItem[] = JSON.parse(await res!.text());
  assertEquals(body.length, 1);
  assertEquals(body[0].order_id, "o1");
  assertSpyCalls(spy, 1);
});
