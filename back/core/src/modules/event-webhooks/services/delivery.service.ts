import { DeliveryRepository } from "../repositories/delivery.repository.ts";
import { WebhookDelivery } from "../webhook.type.ts";

export class DeliveryService {
  private repo = new DeliveryRepository();

  async enqueueDelivery(data: {
    subscription_id: string;
    event_type: string;
    payload_json: unknown;
  }): Promise<WebhookDelivery> {
    return await this.repo.create(data);
  }

  async getDelivery(id: string): Promise<WebhookDelivery | null> {
    return await this.repo.findById(id);
  }

  async listDeliveries(subscriptionId: string): Promise<WebhookDelivery[]> {
    return await this.repo.listBySubscription(subscriptionId);
  }

  async updateStatus(
    id: string,
    status: WebhookDelivery["status"],
    attempts: number,
  ): Promise<WebhookDelivery> {
    return await this.repo.updateStatus(id, status, attempts);
  }
}
