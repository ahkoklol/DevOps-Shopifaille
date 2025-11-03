import { Store, CreateStoreDTO, UpdateStoreDTO } from "../store.type.ts";
import { StoreRepository } from "../repositories/store.repository.ts";
import { PlanRepository } from "../repositories/plan.repository.ts";
import { EventBusService } from "./event-bus.service.ts";

export class StoreService {
  constructor(
    private stores: StoreRepository,
    private plans: PlanRepository,
    private bus: EventBusService,
  ) {}

  async createStore(dto: CreateStoreDTO) {
    const now = new Date().toISOString();
    const store: Store = {
      id: crypto.randomUUID(),
      ownerId: dto.ownerId,
      name: dto.name,
      currency: dto.currency,
      locales: dto.locales,
      timezone: dto.timezone ?? "UTC",
      status: "active",
      createdAt: now,
      updatedAt: now,
      planCode: dto.planCode ?? "FREE",
    };
    await this.stores.insert(store);
    await this.plans.set(store.id, store.planCode, this.featuresForPlan(store.planCode));
    await this.bus.publish("store.created", { storeId: store.id, ownerId: store.ownerId });
    return store;
  }

  async getStoreById(storeId: string) {
    return await this.stores.findById(storeId);
  }

  async updateStore(storeId: string, patch: UpdateStoreDTO) {
    const updated = await this.stores.update(storeId, patch);
    if (!updated) return null;
    await this.bus.publish("store.updated", { storeId, changes: patch });
    if (patch.status) {
      await this.bus.publish("store.status.changed", { storeId, to: patch.status });
    }
    return updated;
  }

  featuresForPlan(code: string): string[] {
    switch (code) {
      case "PRO": return ["themes.custom", "domains.custom", "analytics.basic"];
      case "BUSINESS": return ["themes.custom", "domains.custom", "analytics.advanced", "webhooks"];
      default: return ["themes.basic"];
    }
  }
}
