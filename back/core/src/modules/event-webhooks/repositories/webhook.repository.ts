import { WebhookEndpoint } from "../webhook.type.ts";

export class WebhookRepository {
  private byId = new Map<string, WebhookEndpoint>();
  private byStore = new Map<string, Set<string>>();

  async create(ep: WebhookEndpoint) {
    this.byId.set(ep.id, ep);
    const set = this.byStore.get(ep.storeId) ?? new Set<string>();
    set.add(ep.id); this.byStore.set(ep.storeId, set);
    return ep;
  }

  async update(id: string, patch: Partial<WebhookEndpoint>) {
    const cur = this.byId.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
    this.byId.set(id, next);
    return next;
  }

  async get(id: string) { return this.byId.get(id) ?? null; }

  async delete(id: string) {
    const cur = this.byId.get(id); if (!cur) return false;
    this.byId.delete(id);
    const set = this.byStore.get(cur.storeId); if (set) set.delete(id);
    return true;
  }

  async listByStore(storeId: string) {
    const set = this.byStore.get(storeId) ?? new Set<string>();
    return Array.from(set).map(id => this.byId.get(id)!).filter(Boolean);
  }

  async filterTargets(storeId: string, type: string) {
    // type is like "order.created@v1"
    const endpoints = await this.listByStore(storeId);
    return endpoints.filter(ep =>
      ep.status === "active" && ep.topics.includes(type)
    );
  }
}
