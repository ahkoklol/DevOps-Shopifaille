export interface PublicConfig {
  storeId: string;
  status: "active" | "paused" | "closed";
  primaryDomain: string | null;
  currency: string;
  locales: string[];
  theme: { version: string; variables: Record<string, unknown> };
  navigation: { header: any[]; footer: any[] };
  legalPages: { slug: string; title: string; content: string }[];
}
