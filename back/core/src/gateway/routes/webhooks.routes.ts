import { Hono } from 'hono';
import { WebhookController } from '../../modules/event-webhooks/controllers/webhook.controller';

export const webhooksRoute = new Hono();

// POST /webhooks/subscriptions
webhooksRoute.post('/subscriptions', async (c) => {
  const dto = await c.req.json();
  const sub = await WebhookController.subscribe(dto);
  return c.json(sub, 201);
});

// GET /webhooks/deliveries/:subscriptionId
webhooksRoute.get('/deliveries/:subscriptionId', async (c) => {
  const id = c.req.param('subscriptionId');
  const rows = await WebhookController.listDeliveries(id);
  return c.json(rows);
});

// POST /webhooks/deliveries/:deliveryId/retry
webhooksRoute.post('/deliveries/:deliveryId/retry', async (c) => {
  const id = c.req.param('deliveryId');
  const r = await WebhookController.retry(id);
  return c.json(r);
});
