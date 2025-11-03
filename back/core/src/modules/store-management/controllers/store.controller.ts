import { StoreService } from "../services/store.service.ts";
import { CreateStoreDTO, UpdateStoreDTO } from "../store.type.ts";

export class StoreController {
  constructor(private svc: StoreService) {}

  create = async (body: CreateStoreDTO) => this.svc.createStore(body);
  getOne = async (storeId: string) => this.svc.getStoreById(storeId);
  patch = async (storeId: string, body: UpdateStoreDTO) => this.svc.updateStore(storeId, body);
}

