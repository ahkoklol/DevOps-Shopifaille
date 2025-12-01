// store.service.test.ts
import { assertEquals } from "@std/assert";
import { StoreService } from "../services/store.service.ts";
import type { StoreRepository } from "../repositories/store.repository.ts";

Deno.test("StoreService.createStore calls repo.create", async () => {
  const fakeRepo = {
    findBySubdomain: (_subdomain: string) => Promise.resolve(null),
    create: (dto: Record<string, unknown>) =>
      Promise.resolve({
        id: "s1",
        ...dto,
        plan: dto.plan ?? "free",
        created_at: new Date().toISOString(),
      }),
  };

  const service = new StoreService(fakeRepo as unknown as StoreRepository);

  const result = await service.createStore({
    owner_user_id: "u1",
    name: "Store1",
    subdomain: "sub1",
  });

  assertEquals(result.id, "s1");
  assertEquals(result.name, "Store1");
  assertEquals(result.subdomain, "sub1");
});

Deno.test("StoreService.getStore returns repo result", async () => {
  const fakeRepo = {
    findById: (id: string) =>
      Promise.resolve(
        id === "s1"
          ? {
              id: "s1",
              owner_user_id: "u1",
              name: "Store1",
              subdomain: "sub1",
              plan: "free",
              created_at: new Date().toISOString(),
            }
          : null,
      ),
    };

  const service = new StoreService(fakeRepo as unknown as StoreRepository);

  const store = await service.getStore("s1");
  assertEquals(store?.id, "s1");

  const empty = await service.getStore("s2");
  assertEquals(empty, null);
});

Deno.test("StoreService.listStoresForOwner returns repo list", async () => {
  const fakeRepo = {
    listByOwner: (_ownerId: string) =>
      Promise.resolve([
        {
          id: "s1",
          owner_user_id: "u1",
          name: "Store1",
          subdomain: "sub1",
          plan: "free",
          created_at: new Date().toISOString(),
        },
        {
          id: "s2",
          owner_user_id: "u1",
          name: "Store2",
          subdomain: "sub2",
          plan: "free",
          created_at: new Date().toISOString(),
        },
      ]),
  };

  const service = new StoreService(fakeRepo as unknown as StoreRepository);

  const list = await service.listStoresForOwner("u1");
  assertEquals(list.length, 2);
  assertEquals(list[0].id, "s1");
  assertEquals(list[1].id, "s2");
});
