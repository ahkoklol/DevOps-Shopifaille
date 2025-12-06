// back/core/src/modules/event-webhooks/services/delivery.service.ts

import type { DeliveryRepository } from "../repositories/delivery.repository.ts";
import type { WebhookDelivery } from "../webhook.type.ts";

export class DeliveryService {
  constructor(private repo: DeliveryRepository) {}

  enqueueDelivery(data: {
    subscription_id: string;
    event_type: string;
    payload_json: unknown;
  }): Promise<WebhookDelivery> {
    return this.repo.create(data);
  }

  getDelivery(id: string): Promise<WebhookDelivery | null> {
    return this.repo.findById(id);
  }

  listDeliveries(subscriptionId: string): Promise<WebhookDelivery[]> {
    return this.repo.listBySubscription(subscriptionId);
  }

  updateStatus(
    id: string,
    status: WebhookDelivery["status"],
    attempts: number,
  ): Promise<WebhookDelivery> {
    return this.repo.updateStatus(id, status, attempts);
  }
}
