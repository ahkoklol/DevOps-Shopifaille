import crypto from 'node:crypto';
import { WebhookRepository as repo } from '../repositories/webhook.repository';

function signPayload(secret: string, payload: unknown) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

async function deliverOnce(targetUrl: string, secret: string, eventType: string, payload: unknown, deliveryId: string) {
  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-wh-event': eventType,
        'x-wh-signature': signPayload(secret, payload)
      },
      body: JSON.stringify(payload)
    });
    await repo.markAttempt(deliveryId, res.ok);
  } catch {
    await repo.markAttempt(deliveryId, false);
  }
}

export const WebhookService = {
  subscribe: (dto: { store_id: string; target_url: string; secret: string; event_types: string[]; active?: boolean; }) =>
    repo.createSubscription(dto),

  // Fan-out: appelé par le consumer Kafka
  async fanout(eventType: string, payload: unknown) {
    const subs = await repo.listSubscriptionsForEvent(eventType);
    for (const sub of subs) {
      const d = await repo.insertDelivery({ subscription_id: sub.id, event_type: eventType, payload_json: payload });
      // fire & forget (pas de queue externe ici)
      deliverOnce(sub.target_url, sub.secret, eventType, payload, d.id);
    }
  },

  deliveriesBySubscription: (id: string) => repo.listDeliveriesBySubscription(id),

  async retryDelivery(deliveryId: string) {
    const d = await repo.getDeliveryById(deliveryId);
    if (!d) throw new Error('Delivery not found');

    // récupérer sub associé
    // petite jointure ad-hoc :
    const [sub] = await repo.listSubscriptionsForEvent(d.event_type);
    if (!sub) throw new Error('Subscription not found for event');

    await deliverOnce(sub.target_url, sub.secret, d.event_type, d.payload_json, d.id);
    return { ok: true };
  }
};
