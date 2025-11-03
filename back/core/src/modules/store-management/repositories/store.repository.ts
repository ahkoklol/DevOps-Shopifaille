import { Store } from "../store.type.ts";

export class StoreRepository {
  private db = new Map<string, Store>();

  async insert(store: Store) { this.db.set(store.id, store); return store; }
  async findById(id: string) { return this.db.get(id) ?? null; }
  async update(id: string, patch: Partial<Store>) {
    const cur = this.db.get(id); if (!cur) return null;
    const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
    this.db.set(id, next); return next;
  }
  async exists(id: string) { return this.db.has(id); }
  async findByDomain(domain: string) {
    for (const s of this.db.values()) {
      if ((s as any).domain === domain) return s;
    }
    return null;
  }
}
