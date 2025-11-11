import { WebhookService } from '../services/webhook.service';
import type { SubscribeDto } from '../webhook.type';

export const WebhookController = {
  subscribe: (dto: SubscribeDto) =>
    WebhookService.subscribe({
      store_id: dto.store_id,
      target_url: dto.target_url,
      secret: dto.secret,
      event_types: dto.event_types,
      active: dto.active ?? true
    }),

  listDeliveries: (subscriptionId: string) =>
    WebhookService.deliveriesBySubscription(subscriptionId),

  retry: (deliveryId: string) =>
    WebhookService.retryDelivery(deliveryId)
};
