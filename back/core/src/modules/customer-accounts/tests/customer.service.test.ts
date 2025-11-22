import { assertEquals, assertRejects } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { CustomerService } from "../services/customer.service.ts";
import { Customer } from "../account.type.ts";

// Interface minimaliste pour éviter les warnings
interface MockCustomerRepo {
  findByEmail?: (email: string) => Promise<Customer | null>;
  create?: (data: Partial<Customer>) => Promise<Customer>;
  findById?: (id: string) => Promise<Customer | null>;
}

Deno.test("CustomerService.registerCustomer - creates new customer", async () => {
  const mockRepo: MockCustomerRepo = {
    findByEmail: () => Promise.resolve(null),
    create: () =>
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

  const findStub = stub(mockRepo, "findByEmail");
  const createStub = stub(mockRepo, "create");

  const service = new CustomerService();
  service.setRepo(mockRepo);

  const result = await service.registerCustomer({ email: "test@test.com" });

  assertEquals(result.email, "test@test.com");
  assertSpyCalls(findStub, 1);
  assertSpyCalls(createStub, 1);
});

Deno.test("CustomerService.registerCustomer - throws when email exists", async () => {
  const mockRepo: MockCustomerRepo = {
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

  const findStub = stub(mockRepo, "findByEmail");

  const service = new CustomerService();
  service.setRepo(mockRepo);

  await assertRejects(
    () => service.registerCustomer({ email: "test@test.com" }),
    Error,
    "Customer already exists",
  );

  assertSpyCalls(findStub, 1);
});

Deno.test("CustomerService.getCustomerProfile - returns customer", async () => {
  const mockRepo: MockCustomerRepo = {
    findById: () =>
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

  const findStub = stub(mockRepo, "findById");

  const service = new CustomerService();
  service.setRepo(mockRepo);

  const result = await service.getCustomerProfile("1");

  assertEquals(result?.email, "test@test.com");
  assertSpyCalls(findStub, 1);
});
