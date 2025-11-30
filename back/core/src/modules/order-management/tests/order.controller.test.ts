import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { createOrderRouter } from "../controllers/order.controller.ts";
import { OrderService } from "../services/order.service.ts";
import { Application } from "@oak/oak";
import type { CreateOrderDto, Order, UUID } from "../order.type.ts";

function buildTestApp(router: ReturnType<typeof createOrderRouter>) {
  const app = new Application();
  app.use((_ctx, next) => next());
  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}

Deno.test("POST /orders creates order", async () => {
  const mockService = {
    createOrder: (dto: CreateOrderDto) =>
      Promise.resolve({
        order: {
          id: "o1",
          customer_id: dto.customer_id,
          contact_email: dto.contact_email,
          subtotal: 0,
          discount_total: 0,
          tax_total: 0,
          shipping_total: 0,
          grand_total: 0,
          currency: dto.currency,
          status: "CREATED",
          shipping_address_json: dto.shipping_address_json,
          billing_address_json: dto.billing_address_json,
          created_at: new Date().toISOString(),
        } as Order,
        items: [],
      }),
  };
  const spy = stub(mockService, "createOrder", mockService.createOrder);

  const router = createOrderRouter(mockService as unknown as OrderService);
  const app = buildTestApp(router);

  const dto: CreateOrderDto = {
    customer_id: "c1" as UUID,
    contact_email: "a@b.com",
    currency: "EUR",
    shipping_address_json: {},
    items: [],
  };

  const url = "http://test/orders";
  const req = new Request(url, { method: "POST", body: JSON.stringify(dto) });
  const res = await app.handle(req);

  assertEquals(res!.status, 201);
  const body = JSON.parse(await res!.text());
  assertEquals(body.order.id, "o1");
  assertSpyCalls(spy, 1);
});

Deno.test("GET /orders/:id returns order", async () => {
  const mockService = {
    getOrder: (id: UUID) =>
      Promise.resolve(
        id === "o1"
          ? {
            id,
            customer_id: "c1",
            contact_email: "a@b.com",
            subtotal: 0,
            discount_total: 0,
            tax_total: 0,
            shipping_total: 0,
            grand_total: 0,
            currency: "EUR",
            status: "CREATED",
            shipping_address_json: {},
            created_at: new Date().toISOString(),
          } as Order
          : null,
      ),
  };
  const spy = stub(mockService, "getOrder", mockService.getOrder);

  const router = createOrderRouter(mockService as unknown as OrderService);
  const app = buildTestApp(router);

  const url = "http://test/orders/o1";
  const req = new Request(url, { method: "GET" });
  const res = await app.handle(req);

  assertEquals(res!.status, 200);
  const body: Order = JSON.parse(await res!.text());
  assertEquals(body.id, "o1");
  assertSpyCalls(spy, 1);
});
