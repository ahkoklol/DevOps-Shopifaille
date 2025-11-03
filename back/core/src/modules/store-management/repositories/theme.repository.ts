import { Theme } from "../theme.type.ts";

export class ThemeRepository {
  private drafts = new Map<string, Theme>();  // by storeId
  private live = new Map<string, Theme>();    // by storeId

  async getDraft(storeId: string) { return this.drafts.get(storeId) ?? null; }
  async saveDraft(storeId: string, t: Theme) { this.drafts.set(storeId, t); return t; }
  async getLive(storeId: string) { return this.live.get(storeId) ?? null; }
  async publish(storeId: string, t: Theme) {
    const live = { ...t, status: "published" as const, publishedAt: new Date().toISOString(), version: crypto.randomUUID() };
    this.live.set(storeId, live); return live;
  }
}
