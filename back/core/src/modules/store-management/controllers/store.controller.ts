import { StoreService } from '../services/store.service';
import type {
  CreateStoreDto,
  UpsertBrandingDto,
  UpsertSettingsDto,
  CreateCategoryDto
} from '../store.type';

export const StoreController = {
  async createStore(dto: CreateStoreDto) {
    return await StoreService.createStore(dto);
  },

  async getStore(id: string) {
    return await StoreService.getStore(id);
  },

  async configureBranding(storeId: string, dto: UpsertBrandingDto) {
    return await StoreService.configureBranding(storeId, dto);
  },

  async configureSettings(storeId: string, dto: UpsertSettingsDto) {
    return await StoreService.configureSettings(storeId, dto);
  },

  async listCategories(storeId: string) {
    return await StoreService.listCategories(storeId);
  },

  async addCategory(storeId: string, dto: CreateCategoryDto) {
    return await StoreService.addCategory(storeId, dto);
  }
};
