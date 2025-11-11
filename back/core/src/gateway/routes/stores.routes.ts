import { Hono } from 'hono';
import { StoreController } from '../../modules/store-management/controllers/store.controller';

export const storesRoute = new Hono();

// POST /stores
storesRoute.post('/', async (c) => {
  const body = await c.req.json();
  const store = await StoreController.createStore(body);
  return c.json(store, 201);
});

// GET /stores/:id
storesRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const store = await StoreController.getStore(id);
  if (!store) return c.json({ message: 'Not found' }, 404);
  return c.json(store);
});

// PUT /stores/:id/branding
storesRoute.put('/:id/branding', async (c) => {
  const id = c.req.param('id');
  const dto = await c.req.json();
  const branding = await StoreController.configureBranding(id, dto);
  return c.json(branding);
});

// PUT /stores/:id/settings
storesRoute.put('/:id/settings', async (c) => {
  const id = c.req.param('id');
  const dto = await c.req.json();
  const settings = await StoreController.configureSettings(id, dto);
  return c.json(settings);
});

// GET /stores/:id/categories
storesRoute.get('/:id/categories', async (c) => {
  const id = c.req.param('id');
  const categories = await StoreController.listCategories(id);
  return c.json(categories);
});

// POST /stores/:id/categories
storesRoute.post('/:id/categories', async (c) => {
  const id = c.req.param('id');
  const dto = await c.req.json();
  const cat = await StoreController.addCategory(id, dto);
  return c.json(cat, 201);
});
