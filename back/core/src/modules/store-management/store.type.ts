export interface Store {
  id: string;
  ownerId: string;
  name: string;
  currency: string;
  locales: string[];
  timezone: string;
  status: "active" | "paused" | "closed";
  createdAt: string;
  updatedAt: string;
  planCode: string;
}

export interface CreateStoreDTO {
  ownerId: string;
  name: string;
  currency: string;
  locales: string[];
  timezone?: string;
  planCode?: string;
}

export interface UpdateStoreDTO {
  name?: string;
  currency?: string;
  locales?: string[];
  timezone?: string;
  status?: "active" | "paused" | "closed";
}

export type StoreCustomization = {
  storeId: string;
  themeSettings?: Record<string, unknown>;
  headerText?: string;
  imageUrls?: string[];
  updatedAt: string;
};

export type UpdateCustomizationDTO = {
  themeSettings?: Record<string, unknown>;
  headerText?: string;
  imageUrls?: string[];
};