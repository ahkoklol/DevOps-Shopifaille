import { CreateStoreDto, MerchantStore } from "../store.type.ts";
import { StoreRepository } from "../repositories/store.repository.ts";

export class StoreService {
  private repo = new StoreRepository();

  async createStore(dto: CreateStoreDto): Promise<MerchantStore> {
    const existing = await this.repo.findBySubdomain(dto.subdomain);
    if (existing) throw new Error("Subdomain already in use");

    return await this.repo.create(dto);
  }

  async getStore(id: string): Promise<MerchantStore | null> {
    return await this.repo.findById(id);
  }

  async listStoresForOwner(ownerId: string): Promise<MerchantStore[]> {
    return await this.repo.listByOwner(ownerId);
  }
}
