import {
  assertEquals,
  assertThrowsAsync,
  assertSpyCalls,
  stub,
} from "jsr:@std/testing@0.225.0/mock";
import { CustomerService } from "../services/customer.service.ts";
import { CustomerRepository } from "../repositories/customer.repository.ts";

Deno.test("CustomerService.registerCustomer - creates new customer", async () => {
  const mockRepo = {
    findByEmail: stub(() => Promise.resolve(null)),
    create: stub(() =>
      Promise.resolve({
        id: "1",
        email: "test@test.com",
      })
    ),
  };

  const service = new CustomerService();
  // @ts-ignore
  service.repo = mockRepo;

  const result = await service.registerCustomer({ email: "test@test.com" });

  assertEquals(result.email, "test@test.com");
  assertSpyCalls(mockRepo.findByEmail, 1);
  assertSpyCalls(mockRepo.create, 1);
});

Deno.test("CustomerService.registerCustomer - throws when email exists", async () => {
  const mockRepo = {
    findByEmail: stub(() =>
      Promise.resolve({
        id: "1",
        email: "test@test.com",
      })
    ),
  };

  const service = new CustomerService();
  // @ts-ignore
  service.repo = mockRepo;

  await assertThrowsAsync(
    () => service.registerCustomer({ email: "test@test.com" }),
    Error,
    "Customer already exists",
  );

  assertSpyCalls(mockRepo.findByEmail, 1);
});

Deno.test("CustomerService.getCustomerProfile - returns customer", async () => {
  const mockRepo = {
    findById: stub(() =>
      Promise.resolve({
        id: "1",
        email: "test@test.com",
      })
    ),
  };

  const service = new CustomerService();
  // @ts-ignore
  service.repo = mockRepo;

  const result = await service.getCustomerProfile("1");

  assertEquals(result?.email, "test@test.com");
  assertSpyCalls(mockRepo.findById, 1);
});
