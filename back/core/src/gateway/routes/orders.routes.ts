import { Hono } from 'hono';
import { OrderController } from '../../modules/order-management/controllers/order.controller';

export const ordersRoute = new Hono();

// POST /orders
ordersRoute.post('/', async (c) => {
  const body = await c.req.json();
  const order = await OrderController.createOrder(body);
  return c.json(order, 201);
});

// GET /orders/:id
ordersRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const order = await OrderController.getOrder(id);
  return c.json(order);
});

// POST /orders/:id/payments/capture
ordersRoute.post('/:id/payments/capture', async (c) => {
  const id = c.req.param('id');
  const dto = await c.req.json();
  const tx = await OrderController.capturePayment(id, dto);
  return c.json(tx, 201);
});

// POST /orders/:id/fulfill
ordersRoute.post('/:id/fulfill', async (c) => {
  const id = c.req.param('id');
  await OrderController.fulfill(id);
  return c.body(null, 204);
});

// POST /orders/:id/cancel
ordersRoute.post('/:id/cancel', async (c) => {
  const id = c.req.param('id');
  const { reason } = await c.req.json().catch(() => ({ reason: undefined }));
  await OrderController.cancel(id, reason);
  return c.body(null, 204);
});
