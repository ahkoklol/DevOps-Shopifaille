import { StoreCustomization, UpdateCustomizationDTO } from "../store.type.ts";

export class CustomizationRepository {
  private data = new Map<string, StoreCustomization>(); // key: storeId

  async upsert(storeId: string, patch: UpdateCustomizationDTO): Promise<StoreCustomization> {
    const now = new Date().toISOString();
    const cur = this.data.get(storeId) ?? { storeId, updatedAt: now } as StoreCustomization;
    const next: StoreCustomization = {
      ...cur,
      ...patch,
      updatedAt: now,
    };
    this.data.set(storeId, next);
    return next;
  }

  async get(storeId: string): Promise<StoreCustomization | null> {
    return this.data.get(storeId) ?? null;
  }
}
