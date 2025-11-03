import { DeliveryLog } from "../delivery.type.ts";

export class DeliveryRepository {
  private logs = new Map<string, DeliveryLog>(); // by id
  private byEndpoint = new Map<string, Set<string>>();
  private retryIndex = new Map<string, Set<string>>(); // key: ISO second - ids due

  async create(log: DeliveryLog) {
    this.logs.set(log.id, log);
    const set = this.byEndpoint.get(log.endpointId) ?? new Set<string>();
    set.add(log.id); this.byEndpoint.set(log.endpointId, set);
    if (log.nextAttemptAt) {
      this.indexRetry(log.id, log.nextAttemptAt);
    }
    return log;
  }

  private indexRetry(id: string, iso: string) {
    const key = iso.slice(0, 19); // second precision
    const set = this.retryIndex.get(key) ?? new Set<string>();
    set.add(id); this.retryIndex.set(key, set);
  }

  async update(id: string, patch: Partial<DeliveryLog>) {
    const cur = this.logs.get(id); if (!cur) return null;
    const next = { ...cur, ...patch };
    this.logs.set(id, next);
    if (next.nextAttemptAt) this.indexRetry(id, next.nextAttemptAt);
    return next;
  }

  async get(id: string) { return this.logs.get(id) ?? null; }

  async listByEndpoint(endpointId: string, limit = 100) {
    const set = this.byEndpoint.get(endpointId) ?? new Set<string>();
    const ids = Array.from(set).slice(-limit);
    return ids.map(id => this.logs.get(id)!).filter(Boolean);
  }

  async due(nowIso: string) {
    const key = nowIso.slice(0, 19);
    const set = this.retryIndex.get(key) ?? new Set<string>();
    const out: DeliveryLog[] = [];
    for (const id of set) {
      const log = this.logs.get(id);
      if (log && log.nextAttemptAt && log.nextAttemptAt <= nowIso) out.push(log);
    }
    return out;
  }
}
