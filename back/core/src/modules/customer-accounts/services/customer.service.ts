import { CustomerRepository } from "../repositories/customer.repository.ts";
import { Customer } from "../account.type.ts";

export class CustomerService {
  private repo = new CustomerRepository();

  async registerCustomer(data: Partial<Customer>): Promise<Customer> {
    const existing = await this.repo.findByEmail(data.email!);
    if (existing) throw new Error("Customer already exists");
    return this.repo.create(data);
  }

  async getCustomerProfile(id: string): Promise<Customer | null> {
    return await this.repo.findById(id);
  }
}
