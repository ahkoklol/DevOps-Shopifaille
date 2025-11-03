import { Page } from "../page.type.ts";

export class PageRepository {
  private db = new Map<string, Page[]>(); // by storeId

  async list(storeId: string) { return this.db.get(storeId) ?? []; }

  async create(p: Page) {
    const arr = this.db.get(p.storeId) ?? [];
    arr.push(p); this.db.set(p.storeId, arr); return p;
  }

  async update(storeId: string, pageId: string, patch: Partial<Page>) {
    const arr = this.db.get(storeId) ?? [];
    const idx = arr.findIndex(p => p.id === pageId); if (idx < 0) return null;
    const next = { ...arr[idx], ...patch, updatedAt: new Date().toISOString() };
    arr[idx] = next; this.db.set(storeId, arr); return next;
  }

  async delete(storeId: string, pageId: string) {
    const arr = this.db.get(storeId) ?? [];
    const next = arr.filter(p => p.id !== pageId); this.db.set(storeId, next);
    return arr.length !== next.length;
  }
}
