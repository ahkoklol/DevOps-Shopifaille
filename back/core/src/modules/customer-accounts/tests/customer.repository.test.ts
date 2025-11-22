// back/core/src/modules/customer-accounts/tests/customer.repository.test.ts
import { CustomerRepository } from "../repositories/customer.repository.ts";
import { assert, assertEquals } from "jsr:@std/assert";

Deno.test("CustomerRepository.findById returns object", async () => {
  const fakeDb = {
    queryObject: async () => ({
      rows: [
        {
          id: "1",
          store_id: "s1",
          email: "a@test.com",
          first_name: "John",
          last_name: "Doe",
          phone: null,
          is_guest: false,
          created_at: new Date(),
        },
      ],
    }),
  };

  const repo = new CustomerRepository(Promise.resolve(fakeDb as any));
  const res = await repo.findById("1");

  assert(res);
  assertEquals(res?.id, "1");
});

Deno.test("CustomerRepository.findByEmail returns null when not found", async () => {
  const fakeDb = {
    queryObject: async () => ({ rows: [] }),
  };

  const repo = new CustomerRepository(Promise.resolve(fakeDb as any));
  const res = await repo.findByEmail("x@test.com");

  assertEquals(res, null);
});
