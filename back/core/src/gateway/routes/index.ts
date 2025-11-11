import { Hono } from 'hono';
import { storesRoute } from './stores.routes';
import { ordersRoute } from './orders.routes'; // à venir

export const appRoutes = new Hono();

appRoutes.route('/stores', storesRoute);
appRoutes.route('/orders', ordersRoute);
