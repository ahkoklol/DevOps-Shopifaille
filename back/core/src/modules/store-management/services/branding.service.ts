import { StoreBranding, UpsertBrandingDto } from "../store.type.ts";
import { BrandingRepository } from "../repositories/branding.repository.ts";

export class BrandingService {
  private repo = new BrandingRepository();

  async upsertBranding(storeId: string,
     dto: UpsertBrandingDto
    ): Promise<StoreBranding> {
    return await this.repo.upsert(storeId, dto);
  }

  async getBranding(storeId: string): Promise<StoreBranding | null> {
    return await this.repo.findByStore(storeId);
  }
}
