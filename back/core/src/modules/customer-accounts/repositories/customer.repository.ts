// back/core/src/modules/customer-accounts/repositories/customer.repository.ts

import type { Client } from "postgres";
import { Customer } from "../account.type.ts";

export class CustomerRepository {
  constructor(
    private db: Client, // injection OBLIGATOIRE
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const result = await this.db.queryObject<Customer>(
      `SELECT * FROM customer WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await this.db.queryObject<Customer>(
      `SELECT * FROM customer WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const result = await this.db.queryObject<Customer>(
      `INSERT INTO customer 
        (store_id, email, first_name, last_name, phone, is_guest, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())
       RETURNING *`,
      [
        data.store_id,
        data.email,
        data.first_name,
        data.last_name,
        data.phone,
        data.is_guest ?? false,
      ],
    );

    return result.rows[0];
  }

  async updateName(id: string, first: string, last: string): Promise<Customer> {
    const result = await this.db.queryObject<Customer>(
      `UPDATE customer
       SET first_name = $2, last_name = $3
       WHERE id = $1
       RETURNING *`,
      [id, first, last],
    );
    return result.rows[0];
  }

  async listByStore(storeId: string): Promise<Customer[]> {
    const result = await this.db.queryObject<Customer>(
      `SELECT * FROM customer 
       WHERE store_id = $1 
       ORDER BY created_at DESC`,
      [storeId],
    );
    return result.rows;
  }
}
