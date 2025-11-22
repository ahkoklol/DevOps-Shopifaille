import { CustomerRepository } from "../repositories/customer.repository.ts";
import { Customer } from "../account.type.ts";

export class CustomerService {
  private repo = new CustomerRepository();

  // Setter propre pour injecter un mock dans les tests
  setRepo(
    r: Partial<Pick<CustomerRepository, "findByEmail" | "create" | "findById">>,
  ) {
    // @ts-ignore : CustomerRepository peut avoir plus de méthodes
    this.repo = r;
  }

  async registerCustomer(data: Partial<Customer>): Promise<Customer> {
    const existing = await this.repo.findByEmail!(data.email!);
    if (existing) throw new Error("Customer already exists");
    return this.repo.create!(data);
  }

  async getCustomerProfile(id: string): Promise<Customer | null> {
    return await this.repo.findById!(id);
  }
}
