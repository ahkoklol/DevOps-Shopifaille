// settings.service.ts
import { StoreSettings, UpsertSettingsDto } from "../store.type.ts";
import type { SettingsRepository } from "../repositories/settings.repository.ts";

export class SettingsService {
  constructor(private repo: SettingsRepository) {}

  upsertSettings(
    storeId: string,
    dto: UpsertSettingsDto,
  ): Promise<StoreSettings> {
    return this.repo.upsert(storeId, dto);
  }

  getSettings(storeId: string): Promise<StoreSettings | null> {
    return this.repo.findByStore(storeId);
  }
}
