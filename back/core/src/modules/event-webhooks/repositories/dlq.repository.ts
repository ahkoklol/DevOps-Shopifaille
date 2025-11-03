import { DlqRecord } from "../delivery.type.ts";

export class DlqRepository {
  private rows = new Map<string, DlqRecord>(); // by id
  private byEndpoint = new Map<string, Set<string>>();

  async push(rec: DlqRecord) {
    this.rows.set(rec.id, rec);
    const set = this.byEndpoint.get(rec.endpointId) ?? new Set<string>();
    set.add(rec.id); this.byEndpoint.set(rec.endpointId, set);
    return rec;
  }

  async listByEndpoint(endpointId: string) {
    const set = this.byEndpoint.get(endpointId) ?? new Set<string>();
    return Array.from(set).map(id => this.rows.get(id)!).filter(Boolean);
  }

  async get(id: string) { return this.rows.get(id) ?? null; }

  async remove(id: string) {
    const rec = this.rows.get(id); if (!rec) return false;
    this.rows.delete(id);
    const set = this.byEndpoint.get(rec.endpointId); if (set) set.delete(id);
    return true;
  }
}
