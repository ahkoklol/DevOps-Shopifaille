import { connectToModuleDB } from "../../../shared/db/index.ts";
import { StoreBranding, UpsertBrandingDto } from "../store.type.ts";

const db = await connectToModuleDB("store-management");

export class BrandingRepository {
  async upsert(
    storeId: string,
    data: UpsertBrandingDto,
  ): Promise<StoreBranding> {
    const result = await db.queryObject<StoreBranding>(
      `INSERT INTO store_branding (store_id, theme_preset, logo_url, colors_json)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (store_id)
       DO UPDATE SET
         theme_preset = COALESCE($2, store_branding.theme_preset),
         logo_url = COALESCE($3, store_branding.logo_url),
         colors_json = COALESCE($4::jsonb, store_branding.colors_json)
       RETURNING *`,
      [
        storeId,
        data.theme_preset ?? null,
        data.logo_url ?? null,
        data.colors_json ? JSON.stringify(data.colors_json) : null,
      ],
    );

    return result.rows[0];
  }

  async findByStore(storeId: string): Promise<StoreBranding | null> {
    const result = await db.queryObject<StoreBranding>(
      `SELECT * FROM store_branding WHERE store_id = $1`,
      [storeId],
    );
    return result.rows[0] ?? null;
  }
}
