import { CustomizationRepository } from "../repositories/customization.repository.ts";
import { UpdateCustomizationDTO, StoreCustomization } from "../store.type.ts";

export class CustomizationService {
  constructor(private repo: CustomizationRepository) {}

  async update(storeId: string, patch: UpdateCustomizationDTO): Promise<StoreCustomization> {
    return this.repo.upsert(storeId, patch);
  }

  async get(storeId: string): Promise<StoreCustomization | null> {
    return this.repo.get(storeId);
  }
}
