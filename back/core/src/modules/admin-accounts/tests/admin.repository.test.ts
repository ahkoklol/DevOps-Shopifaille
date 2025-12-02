// back/core/src/modules/admin-accounts/tests/admin.repository.test.ts
import { AdminRepository } from "../repositories/admin.repository.ts";
import { assert, assertEquals } from "@std/assert";
import type { Client } from "postgres";

Deno.test("AdminRepository.findById returns row", async () => {
  const fakeDb = {
    queryObject: (_q: string, _params: unknown[]) =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            email: "a@test.com",
            first_name: "John",
            last_name: "Doe",
            phone: null,
            created_at: new Date(),
          },
        ],
      }),
  };

  const repo = new AdminRepository(fakeDb as unknown as Client);
  const res = await repo.findById("1");

  assert(res);
  assertEquals(res!.email, "a@test.com");
});

Deno.test("AdminRepository.findByEmail returns null", async () => {
  const fakeDb = {
    queryObject: (_q: string, _params: unknown[]) =>
      Promise.resolve({ rows: [] }),
  };

  const repo = new AdminRepository(fakeDb as unknown as Client);

  const res = await repo.findByEmail("x@test.com");
  assertEquals(res, null);
});

Deno.test("AdminRepository.create inserts and returns row", async () => {
  const fakeDb = {
    queryObject: (_query: string, params: unknown[]) =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            email: params[0],
            first_name: params[1],
            last_name: params[2],
            phone: params[3],
            created_at: new Date(),
          },
        ],
      }),
  };

  const repo = new AdminRepository(fakeDb as unknown as Client);

  const result = await repo.create({
    email: "x@test.com",
    first_name: "John",
    last_name: "Doe",
  });

  assertEquals(result.email, "x@test.com");
});

Deno.test("AdminRepository.updateName returns updated row", async () => {
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

  const repo = new AdminRepository(fakeDb as unknown as Client);

  const res = await repo.updateName("1", "Alice", "Smith");

  assertEquals(res.first_name, "Alice");
});
