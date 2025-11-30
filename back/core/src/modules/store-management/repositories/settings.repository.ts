// settings.repository.ts
import type { Client } from "postgres";
import { StoreSettings, UpsertSettingsDto } from "../store.type.ts";

export class SettingsRepository {
  constructor(private db: Client) {}

  async upsert(
    storeId: string,
    data: UpsertSettingsDto,
  ): Promise<StoreSettings> {
    const result = await this.db.queryObject<StoreSettings>(
      `INSERT INTO store_settings (store_id, currency, checkout_rules_json)
       VALUES ($1,$2,$3)
       ON CONFLICT (store_id)
       DO UPDATE SET
         currency = COALESCE($2, store_settings.currency),
         checkout_rules_json = COALESCE($3::jsonb, store_settings.checkout_rules_json)
       RETURNING *`,
      [
        storeId,
        data.currency ?? null,
        data.checkout_rules_json
          ? JSON.stringify(data.checkout_rules_json)
          : null,
      ],
    );
    return result.rows[0];
  }

  async findByStore(storeId: string): Promise<StoreSettings | null> {
    const result = await this.db.queryObject<StoreSettings>(
      `SELECT * FROM store_settings WHERE store_id = $1`,
      [storeId],
    );
    return result.rows[0] ?? null;
  }
}
