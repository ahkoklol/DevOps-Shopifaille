import { Hono } from 'hono';
import { storesRoute } from './stores.routes';
import { ordersRoute } from './orders.routes'; 
import { webhooksRoute } from './webhooks.routes';

export const appRoutes = new Hono();

appRoutes.route('/stores', storesRoute);
appRoutes.route('/orders', ordersRoute);
appRoutes.route('/webhooks', webhooksRoute)
