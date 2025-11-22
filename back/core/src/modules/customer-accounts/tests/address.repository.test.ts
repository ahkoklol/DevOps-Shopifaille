import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { AddressRepository } from "../repositories/address.repository.ts";
import * as DBModule from "../../../shared/db/index.ts";
import type { Client } from "postgres";

// Type minimal pour le fake
interface FakeDB {
  queryObject: () => Promise<{ rows: unknown[] }>;
}

Deno.test("AddressRepository.listByCustomer - returns rows", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "1",
            customer_id: "123",
            type: "shipping",
            line1: "Rue Test",
            city: "Paris",
            region: "IDF",
            postal_code: "75000",
            country: "FR",
            is_default: false,
          },
        ],
      }),
  };

  const dbStub = stub(
    DBModule,
    "connectToModuleDB",
    () => Promise.resolve(fakeDB as unknown as Client),
  );

  const repo = new AddressRepository();
  const rows = await repo.listByCustomer("123");

  assertEquals(rows.length, 1);
  assertEquals(rows[0].line1, "Rue Test");
  assertSpyCalls(dbStub, 1);

  dbStub.restore();
});

Deno.test("AddressRepository.create - inserts & returns row", async () => {
  const fakeDB: FakeDB = {
    queryObject: () =>
      Promise.resolve({
        rows: [
          {
            id: "2",
            customer_id: "123",
            type: "billing",
            line1: "Rue X",
            city: "Lyon",
            region: "ARA",
            postal_code: "69000",
            country: "FR",
            is_default: false,
          },
        ],
      }),
  };

  const dbStub = stub(
    DBModule,
    "connectToModuleDB",
    () => Promise.resolve(fakeDB as unknown as Client),
  );

  const repo = new AddressRepository();
  const row = await repo.create({
    customer_id: "123",
    line1: "Rue X",
  });

  assertEquals(row.city, "Lyon");
  assertSpyCalls(dbStub, 1);

  dbStub.restore();
});
