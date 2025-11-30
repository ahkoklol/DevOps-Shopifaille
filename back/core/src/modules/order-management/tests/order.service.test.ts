import { assertEquals } from "@std/assert";
import { OrderService } from "../services/order.service.ts";
import { OrderRepository } from "../repositories/order.repository.ts";
import { OrderItemRepository } from "../repositories/order-item.repository.ts";
import { OrderLifecycleRepository } from "../repositories/order-lifecycle.repository.ts";
import { OrderStatusEventRepository } from "../repositories/order-status-event.repository.ts";
import type {
  CreateOrderDto,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  UUID,
} from "../order.type.ts";

Deno.test("OrderService.createOrder calls all repos and returns order and items", async () => {
  const fakeOrderRepo: Partial<OrderRepository> = {
    createOrderRow: (data: Partial<Order>) =>
      Promise.resolve({ id: "o1", ...data } as Order),
  };

  const fakeItemRepo: Partial<OrderItemRepository> = {
    createItemsForOrder: (orderId: UUID, items: CreateOrderDto["items"]) =>
      Promise.resolve(
        items.map(
          (item, idx) => ({
            id: `i${idx + 1}`,
            order_id: orderId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            title_snapshot: item.title,
            sku_snapshot: item.sku,
            attributes_snapshot_json: item.attrs ?? null,
            unit_price: item.unit_price,
            qty: item.qty,
            line_total: item.unit_price * item.qty,
          } as OrderItem),
        ),
      ),
  };

  const fakeLifecycleRepo: Partial<OrderLifecycleRepository> = {
    upsertLifecycle: (orderId: UUID, status: OrderStatus) =>
      Promise.resolve({
        order_id: orderId,
        current_status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
  };

  const fakeStatusEventRepo: Partial<OrderStatusEventRepository> = {
    createEvent: (data: {
      order_id: string;
      from_status?: OrderStatus | null;
      to_status: OrderStatus;
      reason?: string | null;
      metadata_json?: unknown;
    }): Promise<OrderStatusEvent> =>
      Promise.resolve({
        id: "ev1",
        order_id: data.order_id,
        from_status: data.from_status ?? null,
        to_status: data.to_status,
        reason: data.reason ?? null,
        occurred_at: new Date().toISOString(),
        metadata_json: data.metadata_json ?? null,
      }),
  };

  const service = new OrderService(
    fakeOrderRepo as OrderRepository,
    fakeItemRepo as OrderItemRepository,
    fakeLifecycleRepo as OrderLifecycleRepository,
    fakeStatusEventRepo as OrderStatusEventRepository,
  );

  const dto: CreateOrderDto = {
    customer_id: "c1" as UUID,
    contact_email: "a@b.com",
    currency: "EUR",
    shipping_address_json: {},
    items: [
      {
        product_id: "p1" as UUID,
        variant_id: "v1" as UUID,
        qty: 1,
        unit_price: 100,
        title: "Item1",
        sku: "SKU1",
      },
    ],
  };

  const { order, items } = await service.createOrder(dto);

  assertEquals(order.id, "o1");
  assertEquals(items.length, 1);
  assertEquals(items[0].order_id, "o1");
  assertEquals(items[0].title_snapshot, "Item1");
});

Deno.test("OrderService.getOrder returns repo result", async () => {
  const fakeOrderRepo: Partial<OrderRepository> = {
    findById: (id: UUID) =>
      Promise.resolve(
        id === "o1" ? ({ id, customer_id: "c1" } as Order) : null,
      ),
  };

  const service = new OrderService(
    fakeOrderRepo as OrderRepository,
    {} as OrderItemRepository,
    {} as OrderLifecycleRepository,
    {} as OrderStatusEventRepository,
  );

  const found = await service.getOrder("o1" as UUID);
  const notFound = await service.getOrder("x" as UUID);

  assertEquals(found?.id, "o1");
  assertEquals(notFound, null);
});
