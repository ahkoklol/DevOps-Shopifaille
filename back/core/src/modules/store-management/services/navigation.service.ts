import { NavigationRepository } from "../repositories/navigation.repository.ts";
import { NavKey, Navigation } from "../navigation.type.ts";
import { EventBusService } from "./event-bus.service.ts";

export class NavigationService {
  constructor(private repo: NavigationRepository, private bus: EventBusService) {}

  async getNavigation(storeId: string, key: NavKey) {
    return await this.repo.get(storeId, key);
  }

  async updateNavigation(storeId: string, key: NavKey, items: Navigation["items"]) {
    const nav: Navigation = { id: crypto.randomUUID(), storeId, key, items };
    const saved = await this.repo.put(storeId, key, nav);
    await this.bus.publish("navigation.updated", { storeId, key });
    return saved;
  }
}
