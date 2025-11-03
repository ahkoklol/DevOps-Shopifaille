import { Hono } from "hono/mod.ts";

// Repositories
import { OrderRepository } from "./repositories/order.repository.ts";
import { ReturnRepository } from "./repositories/return.repository.ts";

// Services
import { EventBusService } from "./services/event-bus.service.ts";
import { ProductsClientService } from "./services/products-client.service.ts";
import { OrderService } from "./services/order.service.ts";
import { ReturnService } from "./services/return.service.ts";
import { AggregatesService } from "./services/aggregates.service.ts";

// Controllers
import { OrdersController } from "./controllers/orders.controller.ts";
import { ReturnsController } from "./controllers/returns.controller.ts";
import { AggregatesController } from "./controllers/aggregates.controller.ts";

// DI container
function buildContainer() {
  const repos = {
    orders: new OrderRepository(),
    returns: new ReturnRepository(),
  };

  const externals = {
    products: new ProductsClientService(),
    bus: new EventBusService(),
  };

  const services = {
    order: new OrderService(repos.orders, externals.products, externals.bus),
    ret: new ReturnService(repos.returns, repos.orders, externals.bus, externals.products),
    aggr: new AggregatesService(repos.orders),
  };

  const controllers = {
    orders: new OrdersController(services.order),
    returns: new ReturnsController(services.ret),
    aggregates: new AggregatesController(services.aggr),
  };

  return { controllers };
}

export function buildOrderManagementRouter() {
  const r = new Hono();
  const { controllers: c } = buildContainer();

  // -------- Internal (Checkout → OM) --------
  r.post("/internal/orders/place", async (ctx) => ctx.json(await c.orders.place(await ctx.req.json())));

  // Payment confirmation (Payment Service / Checkout)
  r.post("/internal/orders/:id/payment-confirmed", async (ctx) =>
    ctx.json(await c.orders.markPaid(ctx.req.param("id"), await ctx.req.json()))
  );

  // -------- Admin Gateway (REST) --------
  r.get("/orders/:id", async (ctx) => {
    const out = await c.orders.getOne(ctx.req.param("id"));
    return out ? ctx.json(out) : ctx.notFound();
  });

  r.get("/orders", async (ctx) => {
    const storeId = ctx.req.query("storeId");
    if (!storeId) return ctx.json({ error: "storeId required" }, 400);
    const status = ctx.req.query("status") ?? undefined;
    const from = ctx.req.query("from") ?? undefined;
    const to = ctx.req.query("to") ?? undefined;
    return ctx.json(await c.orders.list(storeId, { status, from, to }));
  });

  r.put("/orders/:id/status", async (ctx) =>
    ctx.json(await c.orders.updateStatus(ctx.req.param("id"), await ctx.req.json()))
  );

  // Returns
  r.post("/orders/:id/returns", async (ctx) =>
    ctx.json(await c.returns.create(ctx.req.param("id"), await ctx.req.json()), 201)
  );
  r.get("/orders/:id/returns", async (ctx) => ctx.json(await c.returns.list(ctx.req.param("id"))));

  // Aggregates
  r.get("/orders/aggregates", async (ctx) => {
    const storeId = ctx.req.query("storeId");
    if (!storeId) return ctx.json({ error: "storeId required" }, 400);
    const from = ctx.req.query("from") ?? undefined;
    const to = ctx.req.query("to") ?? undefined;
    return ctx.json(await c.aggregates.summary(storeId, { from, to }));
  });

  return r;
}
