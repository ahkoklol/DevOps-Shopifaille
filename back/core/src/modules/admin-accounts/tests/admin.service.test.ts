import { assertEquals, assertRejects } from "@std/assert";
import { AdminService } from "../services/admin.service.ts";
import { AdminRepository } from "../repositories/admin.repository.ts";
import { Admin } from "../admin.type.ts";

Deno.test("AdminService.registerAdmin crée un client", async () => {
  const fakeRepo = {
    findByEmail: () => Promise.resolve(null),
    create: (data: Admin) =>
      Promise.resolve({
        id: "1",
        email: data.email,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        phone: null,
        created_at: new Date(),
      }),
  };

  const service = new AdminService(
    fakeRepo as unknown as AdminRepository,
  );

  const res = await service.registerAdmin({
    email: "test@test.com",
  });

  assertEquals(res.email, "test@test.com");
});

Deno.test("AdminService.registerAdmin → erreur si email existe", async () => {
  const fakeRepo = {
    findByEmail: () =>
      Promise.resolve({
        id: "1",
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        created_at: new Date(),
      }),
  };

  const service = new AdminService(
    fakeRepo as unknown as AdminRepository,
  );

  await assertRejects(
    () => service.registerAdmin({ email: "test@test.com" }),
    Error,
    "Admin already exists",
  );
});

Deno.test("AdminService.getAdminProfile retourne un client", async () => {
  const fakeRepo = {
    findById: (id: string) =>
      Promise.resolve({
        id,
        email: "test@test.com",
        first_name: "John",
        last_name: "Doe",
        created_at: new Date(),
      }),
  };

  const service = new AdminService(
    fakeRepo as unknown as AdminRepository,
  );

  const res = await service.getAdminProfile("1");

  assertEquals(res?.email, "test@test.com");
});
