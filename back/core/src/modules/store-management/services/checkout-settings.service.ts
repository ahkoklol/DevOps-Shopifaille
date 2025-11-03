import { CheckoutSettingsDTO } from "../checkout-settings.type.ts";
import { CheckoutSettingsRepository } from "../repositories/checkout-settings.repository.ts";
import { EventBusService } from "./event-bus.service.ts";

export class CheckoutSettingsService {
  constructor(private repo: CheckoutSettingsRepository, private bus: EventBusService) {}

  async get(storeId: string) { return await this.repo.get(storeId); }

  async update(storeId: string, data: CheckoutSettingsDTO) {
    const current = (await this.repo.get(storeId)) ?? { storeId, taxes: {}, shipping: {}, payments: {} };
    const next = { ...current, ...data };
    const saved = await this.repo.upsert(next);
    await this.bus.publish("settings.checkout.updated", { storeId, sections: Object.keys(data) });
    return saved;
  }
}
