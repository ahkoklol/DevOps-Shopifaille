import { assertEquals, assertRejects } from "jsr:@std/assert";
import { assertSpyCalls, stub } from "jsr:@std/testing/mock";

import { CustomerService } from "../services/customer.service.ts";

Deno.test("CustomerService.registerCustomer - creates new customer", async () => {
  const mockRepo = {
    findByEmail() {},
    create() {},
  };

  const findStub = stub(mockRepo, "findByEmail", () => Promise.resolve(null));

  const createStub = stub(
    mockRepo,
    "create",
    () =>
      Promise.resolve({
        id: "1",
        store_id: "s1",
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        is_guest: false,
        created_at: new Date(),
      }),
  );

  const service = new CustomerService();
  // @ts-ignore
  service.repo = mockRepo;

  const result = await service.registerCustomer({ email: "test@test.com" });

  assertEquals(result.email, "test@test.com");
  assertSpyCalls(findStub, 1);
  assertSpyCalls(createStub, 1);

  findStub.restore();
  createStub.restore();
});

Deno.test("CustomerService.registerCustomer - throws when email exists", async () => {
  const mockRepo = {
    findByEmail() {},
  };

  const findStub = stub(mockRepo, "findByEmail", () =>
    Promise.resolve({
      id: "1",
      store_id: "s1",
      email: "test@test.com",
      first_name: "John",
      last_name: "Doe",
      is_guest: false,
      created_at: new Date(),
    }));

  const service = new CustomerService();
  // @ts-ignore
  service.repo = mockRepo;

  await assertRejects(
    () => service.registerCustomer({ email: "test@test.com" }),
    Error,
    "Customer already exists",
  );

  assertSpyCalls(findStub, 1);
  findStub.restore();
});

Deno.test("CustomerService.getCustomerProfile - returns customer", async () => {
  const mockRepo = {
    findById() {},
  };

  const findStub = stub(
    mockRepo,
    "findById",
    () =>
      Promise.resolve({
        id: "1",
        store_id: "s1",
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        is_guest: false,
        created_at: new Date(),
      }),
  );

  const service = new CustomerService();
  // @ts-ignore
  service.repo = mockRepo;

  const result = await service.getCustomerProfile("1");

  assertEquals(result?.email, "test@test.com");
  assertSpyCalls(findStub, 1);

  findStub.restore();
});
