// Deno supports npm via compatibility layer.
import * as grpc from "npm:@grpc/grpc-js";
import * as protoloader from "npm:@grpc/proto-loader";

// Import your module services directly (reuse same DI as router)
import { WebhookRepository } from "../../modules/event-webhooks/repositories/webhook.repository.ts";
import { DeliveryRepository } from "../../modules/event-webhooks/repositories/delivery.repository.ts";
import { DlqRepository } from "../../modules/event-webhooks/repositories/dlq.repository.ts";

import { SignatureService } from "../../modules/event-webhooks/services/signature.service.ts";
import { SchemaRegistryService } from "../../modules/event-webhooks/services/schema-registry.service.ts";
import { RateLimiterService } from "../../modules/event-webhooks/services/rate-limiter.service.ts";
import { WebhookService } from "../../modules/event-webhooks/services/webhook.service.ts";
import { DispatchService } from "../../modules/event-webhooks/services/dispatch.service.ts";
import { RetryService } from "../../modules/event-webhooks/services/retry.service.ts";
import { IngestService } from "../../modules/event-webhooks/services/ingest.service.ts";

// simple in-memory payload store for replay
const payloadStore = new Map<string, any>();

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

  return { repos, services };
}

export function makeHandlers() {
  const { repos, services } = buildContainer();

  const impl: Record<string, grpc.handleUnaryCall<any, any>> = {
    // ---------- CRUD ----------
    CreateWebhook: async (call, cb) => {
      try {
        const b = call.request;
        const row = await services.webhook.create({
          storeId: b.store_id,
          url: b.url,
          topics: b.topics ?? [],
          format: b.format || "json",
          version: b.version || "v1",
          secret: b.secret || crypto.randomUUID(),
          customHeaders: b.custom_headers ?? {},
          rateLimitQps: b.rate_limit_qps || 10,
          status: (["ACTIVE","PAUSED","DISABLED"] as const)[(b.status || 1) - 1] ?? "active",
          prevSecret: undefined,
          secretGraceUntil: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);
        cb(null, { endpoint: toProtoEndpoint(row) });
      } catch (e) { cb(err(e)); }
    },

    GetWebhook: async (call, cb) => {
      try {
        const row = await services.webhook.get(call.request.id);
        if (!row) return cb(null, {});
        cb(null, { endpoint: toProtoEndpoint(row) });
      } catch (e) { cb(err(e)); }
    },

    ListWebhooks: async (call, cb) => {
      try {
        const list = await services.webhook.listByStore(call.request.store_id);
        cb(null, { endpoints: list.map(toProtoEndpoint) });
      } catch (e) { cb(err(e)); }
    },

    UpdateWebhook: async (call, cb) => {
      try {
        const b = call.request;
        const patch: any = {};
        if (b.url) patch.url = b.url;
        if (b.topics?.length) patch.topics = b.topics;
        if (b.format) patch.format = b.format;
        if (b.version) patch.version = b.version;
        if (b.secret) patch.secret = b.secret;
        if (b.custom_headers) patch.customHeaders = b.custom_headers;
        if (b.rate_limit_qps) patch.rateLimitQps = b.rate_limit_qps;
        if (b.status) patch.status = fromWebhookStatusEnum(b.status);

        const row = await services.webhook.update(b.id, patch);
        if (!row) return cb(null, {});
        cb(null, { endpoint: toProtoEndpoint(row) });
      } catch (e) { cb(err(e)); }
    },

    DeleteWebhook: async (call, cb) => {
      try {
        const ok = await services.webhook.delete(call.request.id);
        cb(null, { deleted: ok });
      } catch (e) { cb(err(e)); }
    },

    RotateSecret: async (call, cb) => {
      try {
        const row = await services.webhook.rotateSecret(call.request.id, call.request.grace_seconds || 3600);
        cb(null, { endpoint: toProtoEndpoint(row!) });
      } catch (e) { cb(err(e)); }
    },

    // ---------- Utilities ----------
    PingWebhook: async (call, cb) => {
      try {
        const ep = await services.webhook.get(call.request.id);
        if (!ep) return cb(null, { ok: false, fanout: 0 });

        const ev = {
          id: crypto.randomUUID(),
          type: "webhook.ping@v1",
          storeId: ep.storeId,
          createdAt: new Date().toISOString(),
          data: { endpointId: ep.id, ts: Date.now() },
        };
        payloadStore.set(ev.id, ev);
        const res = await services.ingest.ingest(ev as any);
        cb(null, { ok: true, fanout: res.fanout });
      } catch (e) { cb(err(e)); }
    },

    // ---------- Ingestion ----------
    IngestEvent: async (call, cb) => {
      try {
        const b = call.request;
        const ev = {
          id: b.id,
          type: b.type,
          storeId: b.store_id,
          createdAt: b.created_at || new Date().toISOString(),
          data: JSON.parse(b.data_json || "{}"),
        };
        payloadStore.set(ev.id, ev);
        const out = await services.ingest.ingest(ev as any);
        cb(null, {
          fanout: out.fanout,
          results: out.results.map((r: any) => ({
            endpoint_id: r.endpointId,
            delivery_id: r.deliveryId,
            status: r.status,
          })),
        });
      } catch (e) { cb(err(e)); }
    },

    // ---------- Observability ----------
    ListDeliveries: async (call, cb) => {
      try {
        const rows = await repos.deliveries.listByEndpoint(call.request.id, 200);
        cb(null, { deliveries: rows.map(toProtoDelivery) });
      } catch (e) { cb(err(e)); }
    },

    ListDlq: async (call, cb) => {
      try {
        const rows = await repos.dlq.listByEndpoint(call.request.id);
        cb(null, { items: rows.map(r => ({
          id: r.id,
          endpoint_id: r.endpointId,
          event_id: r.eventId,
          last_error: r.lastError,
          created_at: r.createdAt,
        })) });
      } catch (e) { cb(err(e)); }
    },

    Replay: async (call, cb) => {
      try {
        const endpointId = call.request.endpoint_id;
        const eventId = call.request.event_id;
        const ep = await repos.webhooks.get(endpointId);
        if (!ep) return cb(err("ENDPOINT_NOT_FOUND"));

        const ev = payloadStore.get(eventId);
        if (!ev) return cb(err("EVENT_PAYLOAD_MISSING"));

        const log = await services.ingest.retryDelivery(ep, ev, 1);
        cb(null, toProtoDelivery(log));
      } catch (e) { cb(err(e)); }
    },

    // ---------- Scheduler ----------
    SchedulerRun: async (_call, cb) => {
      try {
        const nowIso = new Date().toISOString();
        const due = await services.retry.due(nowIso);
        let retried = 0;
        for (const log of due) {
          const ev = payloadStore.get(log.eventId);
          const ep = await repos.webhooks.get(log.endpointId);
          if (!ev || !ep || ep.status !== "active") continue;
          const retriedLog = await services.ingest.retryDelivery(ep, ev, log.attempt + 1);
          await services.retry.maybeToDlq(retriedLog.id);
          retried++;
        }
        cb(null, { retried });
      } catch (e) { cb(err(e)); }
    },
  };

  return impl;
}

// ---------- Helpers ----------
function err(e: any): grpc.ServiceError {
  if (typeof e === "string") return { code: grpc.status.UNKNOWN, name: "Error", message: e } as any;
  return { code: grpc.status.UNKNOWN, name: e?.name ?? "Error", message: e?.message ?? String(e) } as any;
}

function toProtoEndpoint(ep: any) {
  const statusEnum =
    ep.status === "active" ? 1 :
    ep.status === "paused" ? 2 :
    ep.status === "disabled" ? 3 : 0;

  return {
    id: ep.id,
    store_id: ep.storeId,
    url: ep.url,
    topics: ep.topics,
    format: ep.format,
    version: ep.version,
    secret: ep.secret,
    prev_secret: ep.prevSecret ?? "",
    secret_grace_until: ep.secretGraceUntil ?? "",
    custom_headers: ep.customHeaders ?? {},
    rate_limit_qps: ep.rateLimitQps ?? 10,
    status: statusEnum,
    created_at: ep.createdAt,
    updated_at: ep.updatedAt,
  };
}

function fromWebhookStatusEnum(n: number) {
  return n === 1 ? "active" : n === 2 ? "paused" : n === 3 ? "disabled" : "active";
}

function toProtoDelivery(row: any) {
  const statusMap: Record<string, number> = {
    PENDING: 1, SUCCEEDED: 2, FAILED: 3, RETRIABLE: 4, DLQ: 5,
  };
  return {
    id: row.id,
    endpoint_id: row.endpointId,
    event_id: row.eventId,
    attempt: row.attempt ?? 1,
    status: statusMap[row.status] ?? 0,
    response_status: row.responseStatus ?? 0,
    response_body: row.responseBody ?? "",
    error_message: row.errorMessage ?? "",
    signature_hash: row.signatureHash ?? "",
    latency_ms: row.latencyMs ?? 0,
    created_at: row.createdAt,
    next_attempt_at: row.nextAttemptAt ?? "",
    last_tried_at: row.lastTriedAt ?? "",
  };
}
