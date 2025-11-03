import { NavKey, Navigation } from "../navigation.type.ts";

export class NavigationRepository {
  private db = new Map<string, Map<NavKey, Navigation>>();

  async get(storeId: string, key: NavKey) {
    return this.db.get(storeId)?.get(key) ?? null;
  }

  async put(storeId: string, key: NavKey, nav: Navigation) {
    const m = this.db.get(storeId) ?? new Map<NavKey, Navigation>();
    m.set(key, nav); this.db.set(storeId, m); return nav;
  }
}
