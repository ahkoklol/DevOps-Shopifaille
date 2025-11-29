// back/core/src/modules/customer-accounts/services/address.service.ts

import { AddressRepository } from "../repositories/address.repository.ts";
import { CustomerAddress } from "../account.type.ts";

export class AddressService {
  constructor(
    private repo: AddressRepository, // injection obligatoire
  ) {}

  listAddresses(customerId: string): Promise<CustomerAddress[]> {
    return this.repo.listByCustomer(customerId);
  }

  addAddress(data: Partial<CustomerAddress>) {
    return this.repo.create(data);
  }

  setDefault(customerId: string, addressId: string) {
    return this.repo.setDefaultAddress(customerId, addressId);
  }

  removeAddress(id: string) {
    return this.repo.delete(id);
  }
}
