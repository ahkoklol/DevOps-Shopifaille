// store.service.ts
import type { StoreRepository } from "../repositories/store.repository.ts";
import type { CreateStoreDto, MerchantStore } from "../store.type.ts";

export class StoreService {
  constructor(private repo: StoreRepository) {}

  createStore(dto: CreateStoreDto): Promise<MerchantStore> {
    return this.repo.create(dto);
  }

  getStore(id: string): Promise<MerchantStore | null> {
    return this.repo.findById(id);
  }

  listStoresForOwner(ownerId: string): Promise<MerchantStore[]> {
    return this.repo.listByOwner(ownerId);
  }
}
