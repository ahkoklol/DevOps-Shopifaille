import { sql } from '../../../config/database.ts';
import type { MerchantStore, StoreBranding, StoreSettings, StoreCategory } from '../store.type.ts';

export const StoreRepository = {
  async createStore(dto: Omit<MerchantStore,'id'|'created_at'|'plan'> & { plan?: string }): Promise<MerchantStore> {
    const r = await sql<MerchantStore>`
      INSERT INTO merchant_store (owner_user_id, name, subdomain, custom_domain, plan)
      VALUES (${dto.owner_user_id}, ${dto.name}, ${dto.subdomain}, ${dto.custom_domain ?? null}, ${dto.plan ?? 'free'})
      RETURNING *`;
    return r[0];
  },

  async upsertBranding(storeId: string, dto: Partial<StoreBranding>): Promise<StoreBranding> {
    const r = await sql<StoreBranding>`
      INSERT INTO store_branding (store_id, theme_preset, logo_url, colors_json)
      VALUES (${storeId}, ${dto.theme_preset ?? 'default'}, ${dto.logo_url ?? null}, ${JSON.stringify(dto.colors_json ?? {})}::jsonb)
      ON CONFLICT (store_id) DO UPDATE SET
        theme_preset = EXCLUDED.theme_preset,
        logo_url     = EXCLUDED.logo_url,
        colors_json  = EXCLUDED.colors_json
      RETURNING *`;
    return r[0];
  },

  async upsertSettings(storeId: string, dto: Partial<StoreSettings>): Promise<StoreSettings> {
    const r = await sql<StoreSettings>`
      INSERT INTO store_settings (store_id, currency, checkout_rules_json)
      VALUES (${storeId}, ${dto.currency ?? 'USD'}, ${JSON.stringify(dto.checkout_rules_json ?? {})}::jsonb)
      ON CONFLICT (store_id) DO UPDATE SET
        currency = EXCLUDED.currency,
        checkout_rules_json = EXCLUDED.checkout_rules_json
      RETURNING *`;
    return r[0];
  },

  listCategories(storeId: string) {
    return sql<StoreCategory>`SELECT * FROM store_category WHERE store_id=${storeId} ORDER BY sort_order, name`;
  },

  async createCategory(storeId: string, dto: Omit<StoreCategory,'id'|'store_id'>): Promise<StoreCategory> {
    const r = await sql<StoreCategory>`
      INSERT INTO store_category (store_id, parent_category_id, name, slug, sort_order)
      VALUES (${storeId}, ${dto.parent_category_id ?? null}, ${dto.name}, ${dto.slug}, ${dto.sort_order ?? 0})
      RETURNING *`;
    return r[0];
  },

  async getStoreById(id: string) {
    const r = await sql<MerchantStore>`SELECT * FROM merchant_store WHERE id=${id}`;
    return r[0] ?? null;
  }
};
