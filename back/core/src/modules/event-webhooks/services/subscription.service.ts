// back/core/src/modules/event-webhooks/services/subscription.service.ts

import type { SubscriptionRepository } from "../repositories/subscription.repository.ts";
import type { SubscribeDto, WebhookSubscription } from "../webhook.type.ts";

export class SubscriptionService {
  constructor(private repo: SubscriptionRepository) {}

  createSubscription(dto: SubscribeDto): Promise<WebhookSubscription> {
    const event_csv = dto.event_types.join(",");

    return this.repo.create({
      store_id: dto.store_id,
      target_url: dto.target_url,
      secret: dto.secret,
      event_types_csv: event_csv,
      active: dto.active ?? true,
    });
  }

  getSubscription(id: string): Promise<WebhookSubscription | null> {
    return this.repo.findById(id);
  }

  listSubscriptionsByStore(storeId: string): Promise<WebhookSubscription[]> {
    return this.repo.listByStore(storeId);
  }

  activate(id: string): Promise<WebhookSubscription> {
    return this.repo.updateActiveStatus(id, true);
  }

  deactivate(id: string): Promise<WebhookSubscription> {
    return this.repo.updateActiveStatus(id, false);
  }

  listActiveForEvent(storeId: string, eventType: string) {
    return this.repo.findActiveForEvent(storeId, eventType);
  }
}
