import { AddressRepository } from "../repositories/address.repository.ts";
import { CustomerAddress } from "../account.type.ts";

export class AddressService {
  private repo = new AddressRepository();

  async listAddresses(customer_id: string): Promise<CustomerAddress[]> {
    return this.repo.listByCustomer(customer_id);
  }

  async addAddress(data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    return this.repo.create(data);
  }
}
