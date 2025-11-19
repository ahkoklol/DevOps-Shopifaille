export type UUID = string;

export interface MerchantStore {
  id: UUID;
  owner_user_id: UUID;
  name: string;
  subdomain: string;
  custom_domain?: string | null;
  plan: string;
  created_at: string;
}
export interface StoreBranding {
  store_id: UUID;
  theme_preset: string;
  logo_url?: string | null;
  colors_json: Record<string, unknown>;
}
export interface StoreSettings {
  store_id: UUID;
  currency: string;
  checkout_rules_json: Record<string, unknown>;
}
export interface StoreCategory {
  id: UUID;
  store_id: UUID;
  parent_category_id?: UUID | null;
  name: string;
  slug: string;
  sort_order: number;
}

export interface CreateStoreDto {
  owner_user_id: UUID;
  name: string;
  subdomain: string;
  custom_domain?: string | null;
  plan?: string;
}
export interface UpsertBrandingDto { 
  theme_preset?: string;
  logo_url?: string | null;
  colors_json?: unknown;
}
export interface UpsertSettingsDto { 
  currency?: string;
  checkout_rules_json?: unknown;
}
export interface CreateCategoryDto { 
  name: string;
  slug: string;
  parent_category_id?: UUID | null;
  sort_order?: number;
}
