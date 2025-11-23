import { assertEquals } from "@std/assert";
import { AddressService } from "../services/address.service.ts";
import { AddressRepository } from "../repositories/address.repository.ts";

Deno.test("AddressService.listAddresses returns repo data", async () => {
  const fakeRepo = {
    listByCustomer: () =>
      Promise.resolve([{ id: "1", customer_id: "abc", line1: "Rue X" }]),
  };

  const service = new AddressService(fakeRepo as unknown as AddressRepository);

  const rows = await service.listAddresses("abc");

  assertEquals(rows.length, 1);
  assertEquals(rows[0].line1, "Rue X");
});

Deno.test("AddressService.addAddress calls repo", async () => {
  const fakeRepo = {
    create: (data: Record<string, unknown>) =>
      Promise.resolve({ id: "2", ...data }),
  };

  const service = new AddressService(fakeRepo as unknown as AddressRepository);

  const result = await service.addAddress({
    customer_id: "abc",
    line1: "Rue Y",
  });

  assertEquals(result.customer_id, "abc");
});
