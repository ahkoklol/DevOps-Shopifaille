// branding.service.ts
import { StoreBranding, UpsertBrandingDto } from "../store.type.ts";
import type { BrandingRepository } from "../repositories/branding.repository.ts";

export class BrandingService {
  constructor(private repo: BrandingRepository) {}

  upsertBranding(
    storeId: string,
    dto: UpsertBrandingDto,
  ): Promise<StoreBranding> {
    return this.repo.upsert(storeId, dto);
  }

  getBranding(storeId: string): Promise<StoreBranding | null> {
    return this.repo.findByStore(storeId);
  }
}
