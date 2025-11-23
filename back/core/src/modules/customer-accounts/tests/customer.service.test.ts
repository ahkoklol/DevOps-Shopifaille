import { assertEquals, assertRejects } from "@std/assert";
import { CustomerService } from "../services/customer.service.ts";
import { CustomerRepository } from "../repositories/customer.repository.ts";
import { Customer } from "../account.type.ts";

Deno.test("CustomerService.registerCustomer crée un client", async () => {
  const fakeRepo = {
    findByEmail: () => Promise.resolve(null),
    create: (data: Customer) =>
      Promise.resolve({
        id: "1",
        store_id: data.store_id ?? "s1",
        email: data.email,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        phone: null,
        is_guest: false,
        created_at: new Date(),
      }),
  };

  const service = new CustomerService(
    fakeRepo as unknown as CustomerRepository,
  );

  const res = await service.registerCustomer({
    email: "test@test.com",
  });

  assertEquals(res.email, "test@test.com");
});

Deno.test("CustomerService.registerCustomer → erreur si email existe", async () => {
  const fakeRepo = {
    findByEmail: () =>
      Promise.resolve({
        id: "1",
        store_id: "s1",
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        is_guest: false,
        created_at: new Date(),
      }),
  };

  const service = new CustomerService(
    fakeRepo as unknown as CustomerRepository,
  );

  await assertRejects(
    () => service.registerCustomer({ email: "test@test.com" }),
    Error,
    "Customer already exists",
  );
});

Deno.test("CustomerService.getCustomerProfile retourne un client", async () => {
  const fakeRepo = {
    findById: (id: string) =>
      Promise.resolve({
        id,
        store_id: "s1",
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        is_guest: false,
        created_at: new Date(),
      }),
  };

  const service = new CustomerService(
    fakeRepo as unknown as CustomerRepository,
  );

  const res = await service.getCustomerProfile("1");

  assertEquals(res?.email, "test@test.com");
});
