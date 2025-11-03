import { CheckoutSettings } from "../checkout-settings.type.ts";

export class CheckoutSettingsRepository {
  private db = new Map<string, CheckoutSettings>(); // by storeId

  async get(storeId: string) { return this.db.get(storeId) ?? null; }
  async upsert(settings: CheckoutSettings) { this.db.set(settings.storeId, settings); return settings; }
}
