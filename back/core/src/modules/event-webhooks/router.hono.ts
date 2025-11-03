import { Hono } from "hono/mod.ts";

// Repositories
import { WebhookRepository } from "./repositories/webhook.repository.ts";
import { DeliveryRepository } from "./repositories/delivery.repository.ts";
import { DlqRepository } from "./repositories/dlq.repository.ts";

// Services
import { SignatureService } from "./services/signature.service.ts";
import { SchemaRegistryService } from "./services/schema-registry.service.ts";
import { RateLimiterService } from "./services/rate-limiter.service.ts";
import { WebhookService } from "./services/webhook.service.ts";
import { DispatchService } from "./services/dispatch.service.ts";
import { RetryService } from "./services/retry.service.ts";
import { IngestService } from "./services/ingest.service.ts";

// Controllers
import { WebhooksController } from "./controllers/webhook.controller.ts";
import { DeliveriesController } from "./controllers/deliveries.controller.ts";
import { IngestController } from "./controllers/ingest.controller.ts";
import { SchedulerController } from "./controllers/scheduler.controller.ts";

// In-memory payload cache for retry/replay
const payloadStore = new Map<string, unknown>();

function buildContainer() {
  const repos = {
    webhooks: new WebhookRepository(),
    deliveries: new DeliveryRepository(),
    dlq: new DlqRepository(),
  };

  const infra = {
    signer: new SignatureService(),
    registry: new SchemaRegistryService(),
    limiter: new RateLimiterService(),
  };

  const services = {
    webhook: new WebhookService(repos.webhooks, infra.registry),
    dispatch: new DispatchService(infra.signer, infra.registry, infra.limiter),
    retry: new RetryService(repos.deliveries, repos.dlq),
    ingest: new IngestService(repos.webhooks, repos.deliveries, new DispatchService(infra.signer, infra.registry, infra.limiter)),
  };

  const controllers = {
    webhooks: new WebhooksController(services.webhook),
    deliveries: new DeliveriesController(repos.deliveries, repos.dlq),
    ingest: new IngestController(services.ingest),
    scheduler: new SchedulerController(services.retry, repos.deliveries, repos.webhooks, services.ingest),
  };

  return { repos, services, controllers };
}

export function buildEventWebhooksRouter() {
  const r = new Hono();
  const { controllers: c } = buildContainer();

  // --- Webhooks CRUD ---
  r.post("/webhooks", async (ctx) => {
    const body = await ctx.req.json();
    const now = new Date().toISOString();
    const payload = await c.webhooks.create({
      storeId: body.storeId,
      url: body.url,
      topics: body.topics,
      format: body.format ?? "json",
      version: body.version ?? "v1",
      secret: body.secret ?? crypto.randomUUID(),
      prevSecret: undefined,
      secretGraceUntil: undefined,
      customHeaders: body.customHeaders ?? {},
      rateLimitQps: body.rateLimitQps ?? 10,
      status: body.status ?? "active",
      createdAt: now, // ignored by service, but harmless
      updatedAt: now,
    });
    return ctx.json(payload, 201);
  });

  r.get("/webhooks", async (ctx) => {
    const storeId = ctx.req.query("storeId");
    if (!storeId) return ctx.json({ error: "storeId required" }, 400);
    return ctx.json(await c.webhooks.listByStore(storeId));
  });

  r.get("/webhooks/:id", async (ctx) => {
    const row = await c.webhooks.get(ctx.req.param("id"));
    return row ? ctx.json(row) : ctx.notFound();
  });

  r.put("/webhooks/:id", async (ctx) =>
    ctx.json(await c.webhooks.update(ctx.req.param("id"), await ctx.req.json()))
  );

  r.delete("/webhooks/:id", async (ctx) =>
    ctx.json({ deleted: await c.webhooks.delete(ctx.req.param("id")) })
  );

  r.post("/webhooks/:id/rotate-secret", async (ctx) =>
    ctx.json(await c.webhooks.rotateSecret(ctx.req.param("id"), (await ctx.req.json())?.graceSeconds))
  );

  // --- Ping test ---
  r.post("/webhooks/:id/ping", async (ctx) => {
    const id = ctx.req.param("id");
    const row = await c.webhooks.get(id);
    if (!row) return ctx.json({ error: "NOT_FOUND" }, 404);
    const ev = {
      id: crypto.randomUUID(),
      type: "webhook.ping@v1",
      storeId: row.storeId,
      createdAt: new Date().toISOString(),
      data: { endpointId: id, ts: Date.now() },
    };
    payloadStore.set(ev.id, ev);
    const { services: s } = buildContainer(); // new dispatcher for isolation
    const res = await s.ingest.ingest(ev as any);
    return ctx.json(res);
  });

  // --- Ingest events (internal) ---
  r.post("/ingest", async (ctx) => {
    const ev = await ctx.req.json();
    if (!ev?.id || !ev?.type || !ev?.storeId) return ctx.json({ error: "INVALID_EVENT" }, 400);
    ev.createdAt = ev.createdAt ?? new Date().toISOString();
    payloadStore.set(ev.id, ev);
    return ctx.json(await c.ingest.ingest(ev));
  });

  // --- Deliveries logs & DLQ ---
  r.get("/webhooks/:id/deliveries", async (ctx) => ctx.json(await c.deliveries.list(ctx.req.param("id"))));
  r.get("/webhooks/:id/dlq", async (ctx) => ctx.json(await c.deliveries.dlqList(ctx.req.param("id"))));
  r.delete("/dlq/:dlqId", async (ctx) => ctx.json({ deleted: await c.deliveries.dlqRemove(ctx.req.param("dlqId")) }));

  // --- Replay from DLQ ---
  r.post("/webhooks/:id/replay", async (ctx) => {
    const endpointId = ctx.req.param("id");
    const body = await ctx.req.json();
    const eventId = body?.eventId;
    if (!eventId) return ctx.json({ error: "eventId required" }, 400);

    const ev = payloadStore.get(eventId) as any;
    if (!ev) return ctx.json({ error: "EVENT_PAYLOAD_MISSING" }, 404);

    const { repos, services } = buildContainer();
    const ep = await repos.webhooks.get(endpointId);
    if (!ep) return ctx.json({ error: "ENDPOINT_NOT_FOUND" }, 404);

    const log = await services.ingest.retryDelivery(ep, ev, 1);
    return ctx.json(log);
  });

  // --- Scheduler (manual trigger) ---
  r.post("/scheduler/run", async (ctx) => {
    const now = new Date().toISOString();
    const res = await c.scheduler.run(now, async (eventId) => payloadStore.get(eventId) as any ?? null);
    return ctx.json(res);
  });

  // --- Topics catalogue (discovery) ---
  r.get("/topics", async (ctx) => {
    const { services: s } = buildContainer();
    return ctx.json(s.webhook ? (new (s.webhook as any).registry.constructor).listTopics() : new (new SchemaRegistryService()).listTopics());
  });

  return r;
}
