import { StoreSettings, UpsertSettingsDto } from "../store.type.ts";
import { SettingsRepository } from "../repositories/settings.repository.ts";

export class SettingsService {
  private repo = new SettingsRepository();

  async upsertSettings(storeId: string, 
    dto: UpsertSettingsDto,
  ): Promise<StoreSettings> {
    return await this.repo.upsert(storeId, dto);
  }

  async getSettings(storeId: string): Promise<StoreSettings | null> {
    return await this.repo.findByStore(storeId);
  }
}
