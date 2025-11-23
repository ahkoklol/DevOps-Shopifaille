// back/core/src/modules/customer-accounts/tests/customer.repository.test.ts
import { CustomerRepository } from "../repositories/customer.repository.ts";
import { assert, assertEquals } from "@std/assert";
import type { Client } from "postgres";

Deno.test("CustomerRepository.findById returns row", async () => {
  const fakeDb = {
    queryObject: (_q: string, _params: unknown[]) =>
      Promise.resolve({
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

  const repo = new CustomerRepository(fakeDb as unknown as Client);
  const res = await repo.findById("1");

  assert(res);
  assertEquals(res!.email, "a@test.com");
});

Deno.test("CustomerRepository.findByEmail returns null", async () => {
  const fakeDb = {
    queryObject: (_q: string, _params: unknown[]) =>
      Promise.resolve({ rows: [] }),
  };

  const repo = new CustomerRepository(fakeDb as unknown as Client);

  const res = await repo.findByEmail("x@test.com");
  assertEquals(res, null);
});

Deno.test("CustomerRepository.create inserts and returns row", async () => {
  const fakeDb = {
    queryObject: (_query: string, params: unknown[]) =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            store_id: params[0],
            email: params[1],
            first_name: params[2],
            last_name: params[3],
            phone: params[4],
            is_guest: params[5],
            created_at: new Date(),
          },
        ],
      }),
  };

  const repo = new CustomerRepository(fakeDb as unknown as Client);

  const result = await repo.create({
    store_id: "s1",
    email: "x@test.com",
    first_name: "John",
    last_name: "Doe",
  });

  assertEquals(result.email, "x@test.com");
});

Deno.test("CustomerRepository.updateName returns updated row", async () => {
  const fakeDb = {
    queryObject: (_q: string, params: unknown[]) =>
      Promise.resolve({
        rows: [
          {
            id: params[0],
            first_name: params[1],
            last_name: params[2],
          },
        ],
      }),
  };

  const repo = new CustomerRepository(fakeDb as unknown as Client);

  const res = await repo.updateName("1", "Alice", "Smith");

  assertEquals(res.first_name, "Alice");
});

Deno.test("CustomerRepository.listByStore returns array", async () => {
  const fakeDb = {
    queryObject: (_q: string, _params: unknown[]) =>
      Promise.resolve({
        rows: [
          { id: "1", store_id: "s1", email: "a@test.com" },
          { id: "2", store_id: "s1", email: "b@test.com" },
        ],
      }),
  };

  const repo = new CustomerRepository(fakeDb as unknown as Client);

  const rows = await repo.listByStore("s1");

  assertEquals(rows.length, 2);
});
