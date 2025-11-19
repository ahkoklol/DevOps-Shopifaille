import { connectToModuleDB } from "../../../shared/db/index.ts";
import { StoreSettings, UpsertSettingsDto } from "../store.type.ts";

const db = await connectToModuleDB("store-management");

export class SettingsRepository {
  async upsert(
    storeId: string, 
    data: UpsertSettingsDto,
  ): Promise<StoreSettings> {
    const result = await db.queryObject<StoreSettings>(
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
    const result = await db.queryObject<StoreSettings>(
      `SELECT * FROM store_settings WHERE store_id = $1`,
      [storeId],
    );
    return result.rows[0] ?? null;
  }
}
