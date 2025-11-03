export interface Theme {
  id: string;
  storeId: string;
  variables: Record<string, unknown>;
  assets: Record<string, unknown>;
  status: "draft" | "published";
  version?: string;
  publishedAt?: string;
}

export interface ThemeDTO {
  variables: Record<string, unknown>;
  assets?: Record<string, unknown>;
}
