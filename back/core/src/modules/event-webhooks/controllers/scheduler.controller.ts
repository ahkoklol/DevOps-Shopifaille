import { RetryService } from "../services/retry.service.ts";
import { DeliveryRepository } from "../repositories/delivery.repository.ts";
import { WebhookRepository } from "../repositories/webhook.repository.ts";
import { IngestEvent } from "../events.type.ts";
import { IngestService } from "../services/ingest.service.ts";

export class SchedulerController {
  constructor(
    private retry: RetryService,
    private deliveries: DeliveryRepository,
    private webhooks: WebhookRepository,
    private ingestSvc: IngestService,
  ) {}

  // Pull due deliveries and retry them. Caller must provide event payload again.
  async run(nowIso: string, payloadResolver: (eventId: string) => Promise<IngestEvent | null>) {
    const due = await this.retry.due(nowIso);
    const out: Array<{ deliveryId: string; retried?: string; status: string }> = [];
    for (const log of due) {
      const ev = await payloadResolver(log.eventId);
      if (!ev) {
        await this.deliveries.update(log.id, { status: "FAILED", errorMessage: "EVENT_PAYLOAD_MISSING" });
        await this.retry.maybeToDlq(log.id);
        out.push({ deliveryId: log.id, status: "FAILED" });
        continue;
      }

      const ep = await this.webhooks.get(log.endpointId);
      if (!ep || ep.status !== "active") {
        await this.deliveries.update(log.id, { status: "FAILED", errorMessage: "ENDPOINT_INACTIVE" });
        await this.retry.maybeToDlq(log.id);
        out.push({ deliveryId: log.id, status: "FAILED" });
        continue;
      }

      const attempt = log.attempt + 1;
      const retried = await this.ingestSvc.retryDelivery(ep, ev, attempt);
      await this.retry.maybeToDlq(retried.id);
      out.push({ deliveryId: log.id, retried: retried.id, status: retried.status });
    }
    return { retried: out.length, details: out };
  }
}
