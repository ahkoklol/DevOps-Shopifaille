export interface StorePlanRow { storeId: string; code: string; features: string[]; }

export class PlanRepository {
  private db = new Map<string, StorePlanRow>();
  async get(storeId: string) { return this.db.get(storeId) ?? null; }
  async set(storeId: string, code: string, features: string[]) {
    const row = { storeId, code, features }; this.db.set(storeId, row); return row;
  }
}
