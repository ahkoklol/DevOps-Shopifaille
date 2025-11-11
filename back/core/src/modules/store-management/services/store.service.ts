import { StoreRepository as repo } from '../repositories/store.repository.ts';
import type { CreateStoreDto, UpsertBrandingDto, UpsertSettingsDto, CreateCategoryDto } from '../store.type.ts';
import { publish } from '../../../shared/events.ts';

export const StoreService = {
  async createStore(dto: CreateStoreDto) {
    const store = await repo.createStore(dto);
    await publish('store.created', { store_id: store.id, owner_user_id: store.owner_user_id, subdomain: store.subdomain });
    return store;
  },

  async configureBranding(storeId: string, dto: UpsertBrandingDto) {
    const branding = await repo.upsertBranding(storeId, dto);
    await publish('store.branding.updated', { store_id: storeId });
    return branding;
  },

  async configureSettings(storeId: string, dto: UpsertSettingsDto) {
    const settings = await repo.upsertSettings(storeId, dto);
    await publish('store.settings.updated', { store_id: storeId });
    return settings;
  },

  async addCategory(storeId: string, dto: CreateCategoryDto) {
    const cat = await repo.createCategory(storeId, dto);
    await publish('store.category.created', { store_id: storeId, category_id: cat.id });
    return cat;
  },

  listCategories: (storeId: string) => repo.listCategories(storeId),
  getStore: (id: string) => repo.getStoreById(id)
};
