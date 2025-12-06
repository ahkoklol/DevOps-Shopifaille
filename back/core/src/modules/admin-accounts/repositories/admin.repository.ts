// back/core/src/modules/admin-accounts/repositories/admin.repository.ts

import type { Client } from "postgres";
import { Admin, AdminDb } from "../admin.type.ts";

export class AdminRepository {
  constructor(
    private db: Client, // injection OBLIGATOIRE
  ) {}

  async findById(id: string): Promise<Admin | null> {
    const result = await this.db.queryObject<Admin>(
      `SELECT * FROM admin WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const result = await this.db.queryObject<Admin>(
      `SELECT * FROM admin WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async create(data: Partial<Admin>): Promise<Admin> {
    const result = await this.db.queryObject<Admin>(
      `INSERT INTO admin 
        (email, first_name, last_name, phone, created_at)
       VALUES ($1,$2,$3,$4,NOW())
       RETURNING *`,
      [
        data.email,
        data.first_name,
        data.last_name,
        data.phone,
      ],
    );

    return result.rows[0];
  }

  async updateName(id: string, first: string, last: string): Promise<Admin> {
    const result = await this.db.queryObject<Admin>(
      `UPDATE admin
       SET first_name = $2, last_name = $3
       WHERE id = $1
       RETURNING *`,
      [id, first, last],
    );
    return result.rows[0];
  }

  async findDbByEmail(email: string): Promise<AdminDb | null> {
    const result = await this.db.queryObject<AdminDb>`
    SELECT *
    FROM admin
    WHERE email = ${email}
    LIMIT 1
  `;

    return result.rows[0] ?? null;
  }

  async createDb(data: Partial<AdminDb>): Promise<AdminDb> {
    const row = await this.db.queryObject<AdminDb>`
    INSERT INTO admin (email, first_name, last_name, password_hash)
    VALUES (${data.email}, ${data.first_name}, ${data.last_name}, ${data.password_hash})
    RETURNING *
  `;
    return row.rows[0];
  }
}
