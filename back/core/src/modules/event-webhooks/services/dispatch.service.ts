import { WebhookEndpoint } from "../webhook.type.ts";
import { DeliveryLog } from "../delivery.type.ts";
import { SignatureService } from "./signature.service.ts";
import { SchemaRegistryService } from "./schema-registry.service.ts";
import { RateLimiterService } from "./rate-limiter.service.ts";

export interface DispatchResult {
  log: DeliveryLog;
  shouldRetry: boolean;
  error?: string;
}

export class DispatchService {
  constructor(
    private signer: SignatureService,
    private registry: SchemaRegistryService,
    private limiter: RateLimiterService,
  ) {}

  // Returns DeliveryLog plus retry hint.
  async send(ep: WebhookEndpoint, event: { id: string; type: string; data: unknown; createdAt: string }, attempt: number): Promise<DispatchResult> {
    // Validate payload format and topic version
    if (!this.registry.validateTopicVersion(event.type)) {
      return this.fail(ep, event, attempt, "INVALID_TOPIC_VERSION");
    }
    if (!this.registry.validatePayload(event.type, event.data)) {
      return this.fail(ep, event, attempt, "SCHEMA_VALIDATION_FAILED");
    }

    // Rate limiting
    if (!this.limiter.allow(ep.id, ep.rateLimitQps)) {
      return this.retry(ep, event, attempt, 429, "RATE_LIMIT_EXCEEDED");
    }

    // Build body per format
    const body = ep.format === "cloudevents+json"
      ? JSON.stringify({
          specversion: "1.0",
          id: event.id,
          type: event.type,
          source: "core.event-webhooks",
          time: event.createdAt,
          data: event.data,
        })
      : JSON.stringify({
          id: event.id,
          type: event.type,
          createdAt: event.createdAt,
          data: event.data,
        });

    const ts = Math.floor(Date.now() / 1000);
    const signature = await this.signer.buildSignatureHeader(ep.secret, body, ts);

    // Add secondary signature during grace overlap if exists
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Event-Id": event.id,
      "X-Webhook-Signature": signature,
      ...ep.customHeaders,
    };

    // Execute HTTP POST
    const started = performance.now();
    try {
      const res = await fetch(ep.url, { method: "POST", headers, body });
      const latencyMs = Math.round(performance.now() - started);
      const text = await res.text().catch(() => "");

      // 2xx -> success
      if (res.status >= 200 && res.status < 300) {
        const log: DeliveryLog = {
          id: crypto.randomUUID(),
          endpointId: ep.id,
          eventId: event.id,
          attempt,
          status: "SUCCEEDED",
          responseStatus: res.status,
          responseBody: text.slice(0, 2000),
          signatureHash: signature,
          latencyMs,
          createdAt: new Date().toISOString(),
          lastTriedAt: new Date().toISOString(),
        };
        return { log, shouldRetry: false };
      }

      // 429 / 5xx -> retryable
      if (res.status === 429 || res.status >= 500) {
        return this.retry(ep, event, attempt, res.status, text || "RETRYABLE_HTTP_ERROR");
      }

      // Other failures -> non-retryable
      return this.fail(ep, event, attempt, `HTTP_${res.status}`);
    } catch (e) {
      return this.retry(ep, event, attempt, 0, e?.message ?? "NETWORK_ERROR");
    }
  }

  private retry(ep: WebhookEndpoint, event: { id: string }, attempt: number, status: number, msg: string): DispatchResult {
    const delaySec = this.backoff(attempt);
    const nextAttemptAt = new Date(Date.now() + delaySec * 1000).toISOString();
    const log: DeliveryLog = {
      id: crypto.randomUUID(),
      endpointId: ep.id,
      eventId: event.id,
      attempt,
      status: "RETRIABLE",
      responseStatus: status || undefined,
      errorMessage: msg,
      createdAt: new Date().toISOString(),
      nextAttemptAt,
      lastTriedAt: new Date().toISOString(),
    };
    return { log, shouldRetry: true, error: msg };
    }

  private fail(ep: WebhookEndpoint, event: { id: string }, attempt: number, msg: string): DispatchResult {
    const log: DeliveryLog = {
      id: crypto.randomUUID(),
      endpointId: ep.id,
      eventId: event.id,
      attempt,
      status: "FAILED",
      errorMessage: msg,
      createdAt: new Date().toISOString(),
      lastTriedAt: new Date().toISOString(),
    };
    return { log, shouldRetry: false, error: msg };
  }

  // Backoff sequence: 60s, 300s, 900s, 3600s, 21600s, 86400s
  private backoff(attempt: number) {
    const seq = [60, 300, 900, 3600, 21600, 86400];
    return seq[Math.min(attempt - 1, seq.length - 1)];
  }
}
