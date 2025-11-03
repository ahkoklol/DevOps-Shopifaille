import { DeliveryRepository } from "../repositories/delivery.repository.ts";
import { DlqRepository } from "../repositories/dlq.repository.ts";

export class RetryService {
  constructor(private deliveries: DeliveryRepository, private dlq: DlqRepository, private maxAttempts = 6) {}

  // Move to DLQ when attempts exceeded.
  async maybeToDlq(logId: string) {
    const log = await this.deliveries.get(logId);
    if (!log) return;
    if (log.attempt >= this.maxAttempts && (log.status === "RETRIABLE" || log.status === "FAILED")) {
      const rec = {
        id: crypto.randomUUID(),
        endpointId: log.endpointId,
        eventId: log.eventId,
        lastError: log.errorMessage ?? `HTTP_${log.responseStatus ?? "ERROR"}`,
        createdAt: new Date().toISOString(),
      };
      await this.dlq.push(rec);
      await this.deliveries.update(logId, { status: "DLQ" });
    }
  }

  // Fetch due logs and return them to be retried by controller.
  async due(nowIso: string) {
    return this.deliveries.due(nowIso);
  }
}
