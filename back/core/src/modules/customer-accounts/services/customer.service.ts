// back/core/src/modules/customer-accounts/services/customer.service.ts

import type { Customer } from "../account.type.ts";
import type { CustomerRepository } from "../repositories/customer.repository.ts";

export class CustomerService {
  constructor(
    private repo: CustomerRepository, // injection obligatoire
  ) {}

  async registerCustomer(data: Partial<Customer>): Promise<Customer> {
    const existing = await this.repo.findByEmail(data.email!);

    if (existing) {
      throw new Error("Customer already exists");
    }

    return this.repo.create(data);
  }

  async getCustomerProfile(id: string): Promise<Customer | null> {
    return await this.repo.findById(id);
  }
}
