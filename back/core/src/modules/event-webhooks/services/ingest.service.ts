import { IngestEvent } from "../events.type.ts";
import { WebhookRepository } from "../repositories/webhook.repository.ts";
import { DeliveryRepository } from "../repositories/delivery.repository.ts";
import { DispatchService } from "./dispatch.service.ts";

export class IngestService {
  constructor(
    private webhooks: WebhookRepository,
    private deliveries: DeliveryRepository,
    private dispatcher: DispatchService,
  ) {}

  // Ingest a single event and fan-out to matched endpoints.
  async ingest(ev: IngestEvent) {
    const targets = await this.webhooks.filterTargets(ev.storeId, ev.type);
    const results = [];
    for (const ep of targets) {
      const attempt = 1;
      const res = await this.dispatcher.send(ep, ev, attempt);
      await this.deliveries.create(res.log);
      results.push({ endpointId: ep.id, deliveryId: res.log.id, status: res.log.status });
    }
    return { fanout: targets.length, results };
  }

  // Retry a specific delivery (used by scheduler and replay).
  async retryDelivery(endpoint: { id: string }, ev: IngestEvent, attempt: number) {
    const res = await this.dispatcher.send(endpoint as any, ev, attempt);
    await this.deliveries.create(res.log);
    return res.log;
  }
}
