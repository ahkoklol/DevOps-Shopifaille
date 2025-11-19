import { SubscriptionRepository } from "../repositories/subscription.repository.ts";
import { SubscribeDto, WebhookSubscription } from "../webhook.type.ts";

export class SubscriptionService {
  private repo = new SubscriptionRepository();

  async createSubscription(dto: SubscribeDto): Promise<WebhookSubscription> {
    const event_csv = dto.event_types.join(",");

    return await this.repo.create({
      store_id: dto.store_id,
      target_url: dto.target_url,
      secret: dto.secret,
      event_types_csv: event_csv,
      active: dto.active ?? true,
    });
  }

  async getSubscription(id: string): Promise<WebhookSubscription | null> {
    return await this.repo.findById(id);
  }

  async listSubscriptionsByStore(
    storeId: string
  ): Promise<WebhookSubscription[]> {
    return await this.repo.listByStore(storeId);
  }

  async activate(id: string): Promise<WebhookSubscription> {
    return await this.repo.updateActiveStatus(id, true);
  }

  async deactivate(id: string): Promise<WebhookSubscription> {
    return await this.repo.updateActiveStatus(id, false);
  }

  async listActiveForEvent(storeId: string, eventType: string) {
    return await this.repo.findActiveForEvent(storeId, eventType);
  }
}
