import { Domain } from "../domain.type.ts";

export class DomainRepository {
  private db = new Map<string, Domain[]>(); // by storeId

  async add(domain: Domain) {
    const arr = this.db.get(domain.storeId) ?? [];
    arr.push(domain); this.db.set(domain.storeId, arr); return domain;
  }

  async list(storeId: string) { return this.db.get(storeId) ?? []; }

  async update(storeId: string, domainId: string, patch: Partial<Domain>) {
    const arr = this.db.get(storeId) ?? []; const idx = arr.findIndex(d => d.id === domainId);
    if (idx < 0) return null; const next = { ...arr[idx], ...patch }; arr[idx] = next; this.db.set(storeId, arr); return next;
  }

  async setPrimary(storeId: string, domainId: string) {
    const arr = this.db.get(storeId) ?? [];
    let found = null as Domain | null;
    for (const d of arr) { d.isPrimary = d.id === domainId; if (d.isPrimary) found = d; }
    this.db.set(storeId, arr); return found;
  }
}
