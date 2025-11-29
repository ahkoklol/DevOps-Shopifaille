import type { Client } from "postgres";

export interface DbRefreshToken {
  id: string;
  customer_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export class AuthRepository {
  constructor(private db: Client) {}

  async findTokensByCustomer(customerId: string): Promise<DbRefreshToken[]> {
    const res = await this.db.queryObject<DbRefreshToken>(
      `SELECT * FROM refresh_tokens WHERE customer_id = $1`,
      [customerId],
    );
    return res.rows;
  }

  async saveRefreshToken(
    customerId: string,
    tokenHash: string,
    expiresAtISO: string,
  ): Promise<DbRefreshToken> {
    const res = await this.db.queryObject<DbRefreshToken>(
      `INSERT INTO refresh_tokens (customer_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
      [customerId, tokenHash, expiresAtISO],
    );
    return res.rows[0];
  }

  async deleteToken(id: string) {
    await this.db.queryObject(`DELETE FROM refresh_tokens WHERE id = $1`, [id]);
  }

  async deleteAllForCustomer(customerId: string) {
    await this.db.queryObject(
      `DELETE FROM refresh_tokens WHERE customer_id = $1`,
      [customerId],
    );
  }
}
