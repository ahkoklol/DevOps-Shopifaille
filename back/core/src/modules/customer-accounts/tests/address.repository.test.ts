import { assertEquals } from "@std/assert";
import { AddressRepository } from "../repositories/address.repository.ts";
import type { Client } from "postgres";

// Fake DB minimal
interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
  queryArray?: () => Promise<unknown>;
}

Deno.test("AddressRepository.listByCustomer returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            customer_id: "999",
            line1: "Rue XYZ",
            city: "Paris",
            region: "IDF",
            postal_code: "75000",
            country: "FR",
            is_default: false,
          },
        ],
      }),
  };

  // 👉 On passe fakeDB dans le constructeur
  const repo = new AddressRepository(fakeDB as unknown as Client);

  const result = await repo.listByCustomer("999");

  assertEquals(result.length, 1);
  assertEquals(result[0].city, "Paris");
});
