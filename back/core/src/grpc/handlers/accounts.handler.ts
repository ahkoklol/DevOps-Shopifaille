import { Customer } from "../../modules/customer-accounts/account.type.ts";

export const service = undefined;

export const implementation = {
  GetCustomer: async (call: { request: { id: string } }): Promise<Customer> => {
    // Ici tu pourrais récupérer le customer depuis la DB
    const id = call.request.id;

    // Exemple statique / mock
    const customer: Customer = {
      id,
      store_id: "store_123",
      email: "demo@example.com",
      first_name: "Demo",
      last_name: "Customer",
      is_guest: false,
      created_at: new Date(),
      phone: "0123456789",
    };

    return await customer;
  },

  // Exemple d'autres méthodes CRUD
  ListCustomers: async (): Promise<Customer[]> => {
    return await [
      {
        id: "1",
        store_id: "store_123",
        email: "demo1@example.com",
        first_name: "Alice",
        last_name: "Smith",
        is_guest: false,
        created_at: new Date(),
      },
      {
        id: "2",
        store_id: "store_123",
        email: "demo2@example.com",
        first_name: "Bob",
        last_name: "Johnson",
        is_guest: true,
        created_at: new Date(),
      },
    ];
  },
};
