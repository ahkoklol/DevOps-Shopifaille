// back/core/src/modules/admin-accounts/services/admin.service.ts

import type { Admin } from "../admin.type.ts";
import type { AdminRepository } from "../repositories/admin.repository.ts";

export class AdminService {
  constructor(
    private repo: AdminRepository, // injection obligatoire
  ) {}

  async registerAdmin(data: Partial<Admin>): Promise<Admin> {
    const existing = await this.repo.findByEmail(data.email!);

    if (existing) {
      throw new Error("Admin already exists");
    }

    return this.repo.create(data);
  }

  async getAdminProfile(id: string): Promise<Admin | null> {
    return await this.repo.findById(id);
  }
}
